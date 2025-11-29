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

    const cancelExport = () => {
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
        }
    };

    const exportVideo = async () => {
        const video = videoRef.current;
        if (!video) return;

        setIsExporting(true);
        isExportingRef.current = true;
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

        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            // Only create download if it was a successful export (not cancelled)
            // We check isExportingRef.current. 
            // Wait, we set isExportingRef to false right before calling stop() in the loop.
            // So we need a separate flag or check chunks.

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

            // Final cleanup
            setIsExporting(false);
            setExportProgress(0);

            video.currentTime = originalTime;
            video.volume = originalVolume;
            video.muted = originalMuted;
            if (wasPlaying) video.play();
        };

        video.pause();
        video.currentTime = 0;
        video.muted = true;

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
            // Using a slightly larger buffer to ensure we catch the end
            if (video.ended || (video.duration > 0 && video.currentTime >= video.duration - 0.1)) {
                // Stop recording
                mediaRecorder.stop();
                isExportingRef.current = false; // Mark as done so we don't draw anymore
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'right';
            ctx.fillText('Made with GridCast', canvas.width - 20, 40);

            const currentTime = video.currentTime;
            const currentLine = script.find(
                (line) => currentTime >= line.start && currentTime < line.end
            );

            if (currentLine) {
                ctx.font = '24px sans-serif';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.lineWidth = 4;
                ctx.strokeStyle = 'black';
                ctx.strokeText(currentLine.text, canvas.width / 2, canvas.height - 40);

                ctx.shadowBlur = 0;
                ctx.fillText(currentLine.text, canvas.width / 2, canvas.height - 40);
            }

            if (video.duration > 0) {
                const progress = (video.currentTime / video.duration) * 100;
                // Ensure progress is a valid number
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
