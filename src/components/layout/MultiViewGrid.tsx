import React, { useState } from 'react';
import { X, Upload, Zap, Crown, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import VideoPlayer from '../player/VideoPlayer';
import { cn } from '../../lib/utils';
import AdBanner from '../ads/AdBanner';
import PricingModal from '../payment/PricingModal';

interface VideoInstance {
    id: string;
    src: string;
    type: string;
    title: string;
}

export default function MultiViewGrid() {
    const navigate = useNavigate();
    const { user, isPro, isLoading } = useAuthStore();
    const [videos, setVideos] = useState<VideoInstance[]>([
        {
            id: 'demo-1',
            src: '/sample.mp4',
            type: 'video/mp4',
            title: 'Sample Video'
        }
    ]);
    const [isProModalOpen, setIsProModalOpen] = useState(false);

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

        // Reset input value to allow re-selecting the same file
        event.target.value = '';
    };

    const removeVideo = (id: string) => {
        setVideos((prev) => prev.filter((v) => v.id !== id));
    };

    return (
        <div className="flex flex-col h-screen w-full bg-black text-white overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap size={20} className="text-white fill-white" />
                    </div>
                    <h1 className="font-bold text-lg tracking-tight">GridCast Video Editor</h1>
                </div>

                <div className="flex items-center gap-4">
                    {!isLoading && !isPro && (
                        <button
                            onClick={() => setIsProModalOpen(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all group"
                        >
                            <Crown size={14} className="text-indigo-400 group-hover:text-indigo-300" />
                            <span className="text-xs font-semibold text-indigo-300 group-hover:text-white">Upgrade to Pro</span>
                        </button>
                    )}

                    <div className="h-6 w-px bg-white/10 mx-2" />

                    {isLoading ? (
                        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                    ) : user ? (
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg border border-white/10 hover:scale-105 transition-transform"
                        >
                            {user.email?.[0].toUpperCase()}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                        >
                            Log In
                        </button>
                    )}

                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors text-sm font-medium shadow-lg shadow-blue-500/20">
                        <Upload size={18} />
                        <span className="hidden sm:inline">Import Video</span>
                        <input
                            type="file"
                            multiple
                            accept="video/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>

                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 overflow-hidden flex flex-col relative bg-zinc-950">
                <div className={cn(
                    "flex-1 grid gap-4 transition-all duration-300 min-h-0",
                    videos.length === 1 ? "grid-cols-1" :
                        videos.length === 2 ? "grid-cols-2" :
                            videos.length <= 4 ? "grid-cols-2" :
                                "grid-cols-3"
                )}>
                    {videos.map((video) => (
                        <div key={video.id} className="relative group flex flex-col min-h-0 bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/5">
                            <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => removeVideo(video.id)}
                                    className="p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 relative">
                                <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <h3 className="text-white font-medium truncate shadow-black drop-shadow-md">{video.title}</h3>
                                </div>
                                <VideoPlayer
                                    src={video.src}
                                    type={video.type}
                                    title={video.title}
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    ))}

                    {videos.length === 0 && (
                        <div className="col-span-full h-full flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
                                <LayoutGrid size={32} className="text-zinc-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Start Your Project</h3>
                            <p className="text-zinc-400 mb-6 max-w-md text-center">
                                Import videos to start editing, adding subtitles, and creating content.
                            </p>
                            <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-all hover:scale-105 shadow-xl shadow-blue-500/20 font-bold">
                                <Upload size={20} />
                                <span>Import Video</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <AdBanner />
                </div>
            </main>

            <PricingModal
                isOpen={isProModalOpen}
                onClose={() => setIsProModalOpen(false)}
            />
        </div>
    );
}
