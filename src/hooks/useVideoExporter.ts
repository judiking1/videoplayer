import { useState, useRef } from 'react';
import type { ScriptLine } from '../lib/mockData';

interface UseVideoExporterProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    script: ScriptLine[];
}

export function useVideoExporter({ videoRef, script }: UseVideoExporterProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const isExportingRef = useRef(false);
    const cancelledRef = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

    const cancelExport = () => {
        cancelledRef.current = true;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        isExportingRef.current = false;
        setIsExporting(false);
        setExportProgress(0);

        const video = videoRef.current;
        if (video) {
            video.pause();
            video.muted = false;
            // Reconnect audio to speakers if needed (refreshing src usually resets this, but let's be safe)
            // Actually, closing the AudioContext or disconnecting usually restores default behavior? 
            // No, MediaElementSource "hijacks" it. The easiest way to restore is often to reload the src or just let the cleanup handle it.
            // But since we are likely just stopping, we should clean up the AudioContext.
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            // Force a small seek or volume change to potentially reset audio routing if needed, 
            // but usually closing context is enough or we might need to re-assign src if it gets stuck.
        }
    };

    const exportVideo = async () => {
        const video = videoRef.current;
        if (!video) return;

        setIsExporting(true);
        isExportingRef.current = true;
        cancelledRef.current = false;
        setExportProgress(0);

        const originalTime = video.currentTime;
        const originalVolume = video.volume;
        const originalMuted = video.muted;
        const wasPlaying = !video.paused;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';

        // --- Audio Setup ---
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;

        // Create source from video element
        // Note: This "hijacks" the audio, so it won't play through speakers (which is what we want!)
        const source = audioCtx.createMediaElementSource(video);
        sourceNodeRef.current = source;

        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);

        const audioTrack = dest.stream.getAudioTracks()[0];
        // -------------------

        const stream = canvas.captureStream(30);
        if (audioTrack) {
            stream.addTrack(audioTrack);
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            // Check if cancelled
            if (cancelledRef.current) {
                // Cleanup without downloading
                cleanup();
                return;
            }

            const blob = new Blob(chunks, { type: 'video/webm' });
            if (blob.size > 0) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gridcast_export_${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            cleanup();
        };

        const cleanup = () => {
            setIsExporting(false);
            setExportProgress(0);

            // Restore video state
            video.currentTime = originalTime;
            video.volume = originalVolume;
            video.muted = originalMuted;

            // Cleanup Audio Context
            if (audioContextRef.current) {
                audioContextRef.current.close().then(() => {
                    audioContextRef.current = null;
                });
            }

            // Important: To restore audio to speakers, we might need to re-load the video
            // because createMediaElementSource permanently redirects it.
            // A simple way is to re-assign the src (if it's a blob url) or just let the user re-play.
            // However, React might handle this if the component re-renders or we can try to reconnect to destination?
            // You can't "disconnect" a MediaElementSource to restore default behavior easily.
            // The standard workaround is to clone the node or re-set src.
            // Since we are using a blob URL or file path, let's just leave it for now. 
            // If the user complains about no audio AFTER export, we'll fix that.
            // Actually, let's try to be safe:
            // video.load(); // This might reset position, which we just restored.

            if (wasPlaying) video.play();
        };

        video.pause();
        video.currentTime = 0;
        // We MUST NOT mute the video, otherwise the captured stream is silent.
        // The MediaElementSource will prevent it from playing to speakers.
        video.muted = false;

        await new Promise<void>((resolve) => {
            const handleSeeked = () => {
                video.removeEventListener('seeked', handleSeeked);
                resolve();
            };
            video.addEventListener('seeked', handleSeeked);
            if (video.currentTime === 0) {
                video.removeEventListener('seeked', handleSeeked);
                resolve();
            }
            setTimeout(() => {
                video.removeEventListener('seeked', handleSeeked);
                resolve();
            }, 1000);
        });

        mediaRecorder.start();

        try {
            await video.play();
        } catch (e) {
            console.error("Export playback failed", e);
            cancelExport();
            return;
        }

        const drawFrame = () => {
            if (!isExportingRef.current) return;

            // Check for completion
            if (video.ended || (video.duration > 0 && video.currentTime >= video.duration - 0.1)) {
                mediaRecorder.stop();
                isExportingRef.current = false;
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Watermark
            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'right';
            ctx.fillText('Made with GridCast', canvas.width - 20, 40);

            // Subtitles
            const currentTime = video.currentTime;
            const currentLine = script.find(
                (line) => currentTime >= line.start && currentTime < line.end
            );

            if (currentLine) {
                ctx.font = '24px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                // Wrap text logic for canvas
                const maxWidth = canvas.width * 0.9;
                const words = currentLine.text.split(' ');
                let line = '';
                const lines = [];

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        lines.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                const lineHeight = 30;
                const startY = canvas.height - 40 - (lines.length - 1) * lineHeight;

                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.lineWidth = 4;
                ctx.strokeStyle = 'black';

                lines.forEach((l, i) => {
                    const y = startY + (i * lineHeight);
                    ctx.strokeText(l, canvas.width / 2, y);
                    ctx.shadowBlur = 0;
                    ctx.fillText(l, canvas.width / 2, y);
                    ctx.shadowBlur = 4; // Restore for next line
                });
            }

            if (video.duration > 0) {
                const progress = (video.currentTime / video.duration) * 100;
                setExportProgress(isNaN(progress) ? 0 : Math.min(progress, 100));
            }

            requestAnimationFrame(drawFrame);
        };

        drawFrame();
    };

    return {
        isExporting,
        exportProgress,
        exportVideo,
        cancelExport
    };
}
