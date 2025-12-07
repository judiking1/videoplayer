import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="prose prose-invert max-w-none">
                    <h1>Privacy Policy</h1>
                    <p className="lead">Last updated: December 8, 2025</p>

                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as your email address when you sign up.
                        We also collect usage data automatically when you use the service.
                    </p>

                    <h2>2. How We Use Your Information</h2>
                    <p>
                        We use your information to:
                        <ul>
                            <li>Provide and maintain the service</li>
                            <li>Process your payments and upgrades</li>
                            <li>Send you technical notices and support messages</li>
                        </ul>
                    </p>

                    <h2>3. Data Storage</h2>
                    <p>
                        Your project data is stored locally on your device or securely in our cloud database (Supabase).
                    </p>

                    <h2>4. Third-Party Services</h2>
                    <p>
                        We use third-party services for specific functions:
                        <ul>
                            <li><strong>Supabase</strong>: Authentication and Database</li>
                            <li><strong>Kakao</strong>: Social Login (optional)</li>
                        </ul>
                    </p>

                    <h2>5. Your Rights</h2>
                    <p>
                        You have the right to access, correct, or delete your personal information.
                        You can manage your account settings in the Profile page.
                    </p>

                    <h2>6. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at privacy@gridcast.io.
                    </p>
                </div>
            </div>
        </div>
    );
}
