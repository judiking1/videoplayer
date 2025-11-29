import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
    isMuted: boolean;
    onToggleMute: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    playbackRate: number;
    onPlaybackRateChange: (rate: number) => void;
    onToggleScript: () => void;
    isScriptOpen: boolean;
    onExport: () => void;
}

export default function Controls({
    isPlaying,
    onPlayPause,
    currentTime,
    duration,
    onSeek,
    volume,
    onVolumeChange,
    isMuted,
    onToggleMute,
    isFullscreen,
    onToggleFullscreen,
    playbackRate,
    onPlaybackRateChange,
    onToggleScript,
    isScriptOpen,
    onExport,
}: ControlsProps) {
    const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
    const speedMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
                setIsSpeedMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col gap-2 w-full text-white">
            {/* Seek Bar */}
            <div className="relative group/seek w-full h-2 cursor-pointer">
                <div className="absolute inset-0 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>

            <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onPlayPause}
                        className="hover:bg-white/10 p-2 rounded-full transition-colors"
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>

                    <div className="flex items-center gap-2 group/volume relative">
                        <button
                            onClick={onToggleMute}
                            className="hover:bg-white/10 p-2 rounded-full transition-colors"
                        >
                            {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={isMuted ? 0 : volume}
                                onChange={(e) => onVolumeChange(Number(e.target.value))}
                                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>
                    </div>

                    <span className="text-sm font-medium font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Playback Rate Dropdown */}
                    <div className="relative" ref={speedMenuRef}>
                        <button
                            onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                            className="text-sm font-bold hover:bg-white/10 px-2 py-1 rounded transition-colors"
                        >
                            {playbackRate}x
                        </button>

                        {isSpeedMenuOpen && (
                            <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-md rounded-lg p-2 flex flex-col gap-1 min-w-[80px] shadow-xl border border-white/10">
                                {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => {
                                            onPlaybackRateChange(rate);
                                            setIsSpeedMenuOpen(false);
                                        }}
                                        className={cn(
                                            "text-sm px-2 py-1 rounded hover:bg-white/20 text-left",
                                            playbackRate === rate && "text-blue-400"
                                        )}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onToggleScript}
                        className={cn(
                            "hover:bg-white/10 p-2 rounded-full transition-colors",
                            isScriptOpen && "text-blue-400 bg-white/10"
                        )}
                        title="Toggle Transcript"
                    >
                        <FileText size={20} />
                    </button>

                    <button
                        onClick={onExport}
                        className="bg-white text-black px-3 py-1 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors"
                    >
                        Export
                    </button>

                    <button
                        onClick={onToggleFullscreen}
                        className="hover:bg-white/10 p-2 rounded-full transition-colors"
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
