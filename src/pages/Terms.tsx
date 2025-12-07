import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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
                    <h1>Terms of Service</h1>
                    <p className="lead">Last updated: December 8, 2025</p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using GridCast ("the Service"), you agree to be bound by these Terms of Service.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        GridCast is an online video editing tool. We provide both free and paid ("Pro") subscription plans.
                    </p>

                    <h2>3. User Accounts</h2>
                    <p>
                        You are responsible for maintaining the security of your account credentials.
                        You must not share your account with others.
                    </p>

                    <h2>4. Pro Subscription & Refunds</h2>
                    <p>
                        Pro subscriptions are activated upon confirmation of payment.
                        Refunds are available within 7 days of purchase if the service has not been substantially used.
                        Contact support for refund requests.
                    </p>

                    <h2>5. Intellectual Property</h2>
                    <p>
                        You retain all rights to the videos you create.
                        GridCast retains rights to the software and design of the tool.
                    </p>

                    <h2>6. Limitation of Liability</h2>
                    <p>
                        GridCast is provided "as is". We are not liable for any data loss or damages arising from the use of the service.
                    </p>

                    <h2>7. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of new terms.
                    </p>

                    <h2>8. Contact</h2>
                    <p>
                        For any questions regarding these terms, please contact us at support@gridcast.io.
                    </p>
                </div>
            </div>
        </div>
    );
}
