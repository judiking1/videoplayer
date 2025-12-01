import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn } from 'lucide-react';

export default function Login() {
    const { signInWithGoogle, user, isLoading } = useAuthStore();
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

                <p className="mt-6 text-xs text-white/40">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
