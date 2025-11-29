import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import VideoPlayer from '../player/VideoPlayer';
import { cn } from '../../lib/utils';

interface VideoInstance {
    id: string;
    src: string;
    type: string;
    title: string;
}

export default function MultiViewGrid() {
    const [videos, setVideos] = useState<VideoInstance[]>([
        {
            id: 'demo-1',
            src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            type: 'application/x-mpegURL',
            title: 'Demo Stream (HLS)'
        }
    ]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newVideos: VideoInstance[] = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            src: URL.createObjectURL(file),
            type: file.type || 'video/mp4',
            title: file.name
        }));

        setVideos((prev) => [...prev, ...newVideos]);
    };

    const removeVideo = (id: string) => {
        setVideos((prev) => prev.filter((v) => v.id !== id));
    };

    return (
        <div className="w-full h-full p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Multi-View Player</h2>
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                    <Upload size={20} />
                    <span>Add Videos</span>
                    <input
                        type="file"
                        multiple
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>
            </div>

            <div className={cn(
                "grid gap-4 w-full",
                videos.length === 1 ? "grid-cols-1" :
                    videos.length === 2 ? "grid-cols-2" :
                        videos.length <= 4 ? "grid-cols-2" :
                            "grid-cols-3"
            )}>
                {videos.map((video) => (
                    <div key={video.id} className="relative group">
                        <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => removeVideo(video.id)}
                                className="p-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-white/5">
                            <div className="aspect-video">
                                <VideoPlayer
                                    src={video.src}
                                    type={video.type}
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="p-3 bg-zinc-900">
                                <h3 className="text-sm font-medium text-zinc-200 truncate">{video.title}</h3>
                            </div>
                        </div>
                    </div>
                ))}

                {videos.length === 0 && (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-700 rounded-xl">
                        <p>No videos selected</p>
                        <p className="text-sm">Upload videos to start watching</p>
                    </div>
                )}
            </div>
        </div>
    );
}
