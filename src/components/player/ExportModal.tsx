import { Download, Lock, CheckCircle } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExportFree: () => void;
    onExportPro: () => void;
}

export default function ExportModal({ isOpen, onClose, onExportFree, onExportPro }: ExportModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Export Video</h2>
                    <p className="text-zinc-400">Choose your export method</p>
                </div>

                <div className="grid md:grid-cols-2 gap-0">
                    {/* Free Plan */}
                    <div className="p-8 border-r border-white/10 hover:bg-white/5 transition-colors">
                        <div className="flex flex-col h-full">
                            <div className="mb-6">
                                <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium">Free</span>
                                <h3 className="text-3xl font-bold text-white mt-4">Watermarked</h3>
                                <p className="text-zinc-400 mt-2">Export with GridCast branding</p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-zinc-300">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>720p Resolution</span>
                                </li>
                                <li className="flex items-center gap-2 text-zinc-300">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>Burned-in Subtitles</span>
                                </li>
                                <li className="flex items-center gap-2 text-zinc-300">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>GridCast Watermark</span>
                                </li>
                            </ul>

                            <button
                                onClick={onExportFree}
                                className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                Export Free
                            </button>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-8 bg-gradient-to-b from-blue-900/20 to-transparent">
                        <div className="flex flex-col h-full">
                            <div className="mb-6">
                                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium">Pro</span>
                                <h3 className="text-3xl font-bold text-white mt-4">Clean Video</h3>
                                <p className="text-blue-200 mt-2">Professional quality export</p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-center gap-2 text-white">
                                    <CheckCircle size={16} className="text-blue-400" />
                                    <span>1080p/4K Resolution</span>
                                </li>
                                <li className="flex items-center gap-2 text-white">
                                    <CheckCircle size={16} className="text-blue-400" />
                                    <span>No Watermark</span>
                                </li>
                                <li className="flex items-center gap-2 text-white">
                                    <CheckCircle size={16} className="text-blue-400" />
                                    <span>Priority Rendering</span>
                                </li>
                            </ul>

                            <button
                                onClick={onExportPro}
                                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Lock size={20} />
                                Unlock Pro
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-black/20 border-t border-white/10 text-center">
                    <button onClick={onClose} className="text-zinc-500 hover:text-white text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
