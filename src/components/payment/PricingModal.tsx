import { useState } from 'react';
import { X, CheckCircle, Copy, Send } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const { user } = useAuthStore();
    const [isRequested, setIsRequested] = useState(false);

    if (!isOpen) return null;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        alert(`Copied: ${text}`);
    };

    const handleRequest = () => {
        if (!user) {
            alert("Please log in first.");
            return;
        }
        // In a real app, you would send an API request here to notify admin
        setIsRequested(true);
        alert("Deposit notification sent! We will activate your Pro account after confirmation.");
        setTimeout(() => {
            onClose();
            setIsRequested(false);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
                    <p className="text-zinc-400 mb-6">Unlock full potential via Bank Transfer</p>

                    <div className="space-y-4 mb-6 text-left bg-white/5 p-5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 text-zinc-200">
                            <CheckCircle size={18} className="text-green-500 shrink-0" />
                            <span>Remove Watermark</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-200">
                            <CheckCircle size={18} className="text-green-500 shrink-0" />
                            <span>4K & 1080p Export</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-200">
                            <CheckCircle size={18} className="text-green-500 shrink-0" />
                            <span>Priority Rendering</span>
                        </div>
                        <div className="flex items-center gap-3 text-zinc-200">
                            <CheckCircle size={18} className="text-green-500 shrink-0" />
                            <span>Subtitle Export (SRT/VTT)</span>
                        </div>
                    </div>

                    {/* Bank Transfer Info */}
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-6 text-left">
                        <p className="text-blue-200 text-xs font-semibold uppercase mb-2 tracking-wider">Deposit Account</p>
                        <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-blue-500/10 mb-2">
                            <div>
                                <p className="text-zinc-400 text-xs">ShinhanBank</p>
                                <p className="text-white font-mono font-medium">110-344-748940</p>
                            </div>
                            <button
                                onClick={() => handleCopy("110-344-748940")}
                                className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                                title="Copy Account Number"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        <div className="text-xs text-zinc-400">
                            <p>Amount: <span className="text-white font-bold">₩9,900</span> (Lifetime)</p>
                            <p className="mt-1">Owner: <span className="text-zinc-300">Lee WonBae</span></p>
                        </div>
                    </div>

                    <p className="text-xs text-zinc-500 mb-6 px-4 leading-relaxed">
                        After depositing, please click the button below.
                        <br />
                        We will upgrade your account within 24 hours.
                    </p>

                    <button
                        onClick={handleRequest}
                        disabled={isRequested}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {isRequested ? (
                            <span>Request Sent!</span>
                        ) : (
                            <>
                                <Send size={20} />
                                I Sent the Money
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
