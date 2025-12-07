import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn } from 'lucide-react';

export default function Login() {
    const { signInWithGoogle, signInWithKakao, user, isLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/profile');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl max-w-md w-full text-center">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Welcome to GridCast
                </h1>
                <p className="text-white/60 mb-8">Sign in to access Pro features and manage your account.</p>

                <button
                    onClick={signInWithGoogle}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    <LogIn className="w-5 h-5" />
                    {isLoading ? 'Loading...' : 'Sign in with Google'}
                </button>

                <button
                    onClick={signInWithKakao}
                    disabled={isLoading}
                    className="w-full mt-3 flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#FEE500] text-[#000000] font-semibold hover:bg-[#FDD835] transition-colors disabled:opacity-50"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M12 3C5.9 3 1 6.9 1 11.8c0 3.2 2.1 5.9 5.3 7.5-.2.8-.8 2.8-.9 3.2 0 .1 0 .2.1.3.1.1.3.1.4 0 .4-.2 2.6-1.8 3.7-2.5.8.1 1.6.2 2.4.2 6.1 0 11-3.9 11-8.8S18.1 3 12 3z" />
                    </svg>
                    Sign in with Kakao
                </button>

                <button
                    onClick={() => navigate('/')}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                    Continue as Guest
                </button>

                <p className="mt-6 text-xs text-white/40">
                    By signing in, you agree to our <a href="/terms" className="hover:text-white underline">Terms of Service</a> and <a href="/privacy" className="hover:text-white underline">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}
