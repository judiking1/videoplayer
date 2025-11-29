import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { cn } from '../../lib/utils';
import Controls from './Controls';
import Watermark from './Watermark';
import ScriptViewer from './ScriptViewer';
import ExportModal from './ExportModal';
import SubtitleOverlay from './SubtitleOverlay';
import { useVideoExporter } from '../../hooks/useVideoExporter';
import { MOCK_SCRIPT, type ScriptLine } from '../../lib/mockData';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    type?: 'application/x-mpegURL' | 'video/mp4' | string;
    className?: string;
    poster?: string;
    autoPlay?: boolean;
}

export default function VideoPlayer({ src, type, className, poster, autoPlay = false }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isScriptOpen, setIsScriptOpen] = useState(false);
    const [script, setScript] = useState<ScriptLine[]>(MOCK_SCRIPT);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const controlsTimeoutRef = useRef<number | null>(null);

    const { isExporting, exportProgress, exportVideo, cancelExport } = useVideoExporter({
        videoRef,
        script
    });

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            if (autoPlay) video.play();
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        if (Hls.isSupported() && type === 'application/x-mpegURL') {
            hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (autoPlay) video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl') && type === 'application/x-mpegURL') {
            video.src = src;
        } else {
            video.src = src;
        }

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            if (hls) hls.destroy();
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [src, type, autoPlay]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (newVolume: number) => {
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            videoRef.current.muted = newMuted;
            setIsMuted(newMuted);
            if (newMuted) {
                setVolume(0);
            } else {
                setVolume(1);
                videoRef.current.volume = 1;
            }
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handlePlaybackRateChange = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = window.setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    const handleMouseLeave = () => {
        if (isPlaying) {
            setShowControls(false);
        }
    };

    const handleUpdateScript = (newScript: ScriptLine[]) => {
        setScript(newScript);
    };

    const handleExportFree = () => {
        setIsExportModalOpen(false);
        exportVideo();
    };

    const handleExportPro = () => {
        alert("Please contact admin to unlock Pro features!");
        setIsExportModalOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative group bg-black overflow-hidden rounded-xl shadow-2xl", className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onContextMenu={(e) => e.preventDefault()} // Disable right click
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                poster={poster}
                playsInline
                onClick={togglePlay}
                crossOrigin="anonymous" // Required for canvas export if video is from external source
            />

            {/* Security Features */}
            <Watermark />
            <div className="absolute inset-0 z-10" onClick={togglePlay} />

            {/* Subtitles */}
            <SubtitleOverlay script={script} currentTime={currentTime} />

            {/* Script Viewer */}
            <ScriptViewer
                script={script}
                currentTime={currentTime}
                onSeek={handleSeek}
                isOpen={isScriptOpen}
                onClose={() => setIsScriptOpen(false)}
                onUpdateScript={handleUpdateScript}
            />

            {/* Export Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExportFree={handleExportFree}
                onExportPro={handleExportPro}
            />

            {/* Export Progress Overlay */}
            {isExporting && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white">
                    <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
                    <h3 className="text-xl font-bold mb-2">Exporting Video...</h3>
                    <p className="text-zinc-400 mb-4">Please wait while we render your video.</p>

                    <div className="w-full max-w-xs px-4 mb-6">
                        <progress
                            value={exportProgress}
                            max={100}
                            className="w-full h-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-zinc-800 [&::-webkit-progress-value]:bg-blue-500 [&::-moz-progress-bar]:bg-blue-500"
                        />
                    </div>
                    <p className="mb-6 text-sm font-mono text-blue-400">{Math.round(exportProgress)}%</p>

                    <button
                        onClick={cancelExport}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-medium transition-colors border border-white/10"
                    >
                        Cancel Export
                    </button>
                </div>
            )}

            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 px-4 pb-4 pt-12 bg-gradient-to-t from-black/80 to-transparent",
                    showControls && !isExporting ? "opacity-100" : "opacity-0"
                )}
            >
                <Controls
                    isPlaying={isPlaying}
                    onPlayPause={togglePlay}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                    volume={volume}
                    onVolumeChange={handleVolumeChange}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                    playbackRate={playbackRate}
                    onPlaybackRateChange={handlePlaybackRateChange}
                    onToggleScript={() => setIsScriptOpen(!isScriptOpen)}
                    isScriptOpen={isScriptOpen}
                    onExport={() => setIsExportModalOpen(true)}
                />
            </div>
        </div>
    );
}
