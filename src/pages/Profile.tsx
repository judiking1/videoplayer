import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Crown, User as UserIcon, ArrowLeft, CreditCard } from 'lucide-react';
import { requestPayment } from '../lib/portone';
import { supabase } from '../lib/supabase';

export default function Profile() {
    const { user, signOut, isPro } = useAuthStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        if (!user) return;

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

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Please log in to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Editor
                </button>

                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {user.email}
                                {isPro && <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                            </h1>
                            <p className="text-white/60">User ID: {user.id}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <Crown className="w-5 h-5 text-yellow-400" />
                                Subscription Status
                            </h2>
                            <p className="text-white/80">
                                {isPro ? 'You are a PRO member!' : 'You are currently on the Free plan.'}
                            </p>
                            {!isPro && (
                                <button
                                    onClick={handlePayment}
                                    disabled={isProcessing}
                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isProcessing ? 'Processing...' : (
                                        <>
                                            <CreditCard size={16} />
                                            Upgrade to Pro
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                <UserIcon className="w-5 h-5" />
                                Account Settings
                            </h2>
                            <p className="text-white/60 text-sm mb-4">
                                Manage your account details and preferences.
                            </p>
                            <button
                                onClick={() => signOut().then(() => navigate('/login'))}
                                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
