import { useState } from 'react';
import { X, CheckCircle, CreditCard, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { requestPayment } from '../../lib/portone';
import { supabase } from '../../lib/supabase';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: PricingModalProps) {
    const { user } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePayment = async () => {
        if (!user) {
            alert("Please log in to upgrade.");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await requestPayment({
                orderName: "GridCast Pro Subscription",
                totalAmount: 9900,
                currency: "KRW",
                payMethod: "EASY_PAY",
                customer: {
                    email: user.email || "",
                    fullName: user.email?.split('@')[0] || "User",
                    phoneNumber: "010-1234-5678",
                }
            });



            // ...

            if (!response.code) {
                // Update Supabase profile
                const { error } = await supabase
                    .from('profiles')
                    .update({ is_pro: true })
                    .eq('id', user.id);

                if (error) {
                    console.error("Error updating profile:", error);
                    alert("Payment successful but failed to update profile. Please contact support.");
                } else {
                    alert("Payment successful! You are now a Pro member.");
                    window.location.reload();
                }
            } else {
                alert(`Payment failed: ${response.message}`);
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("An error occurred during payment.");
        } finally {
            setIsProcessing(false);
        }
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
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                        <Crown size={32} className="text-white" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
                    <p className="text-zinc-400 mb-8">Unlock the full potential of GridCast</p>

                    <div className="space-y-4 mb-8 text-left bg-white/5 p-6 rounded-xl border border-white/10">
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
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {isProcessing ? (
                            <span>Processing...</span>
                        ) : (
                            <>
                                <CreditCard size={20} />
                                Upgrade for ₩9,900
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
