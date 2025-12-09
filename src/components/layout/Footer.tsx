import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="w-full bg-zinc-950/80 border-t border-white/10 flex flex-col items-center justify-center py-8 shrink-0 relative z-40">
            {/* Ad Placeholder (Admin Email) */}
            <div className="mb-6 w-full max-w-[728px] h-[90px] border border-dashed border-zinc-800 bg-zinc-900/50 rounded-lg flex items-center justify-center text-zinc-500 text-xs font-mono">
                Banner Ad Area (judiking1@naver.com)
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-zinc-500">
                <div className="flex items-center gap-4">
                    <Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
                    <span className="w-px h-3 bg-zinc-800" />
                    <Link to="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
                </div>

                <div className="w-px h-3 bg-zinc-800" />

                <p>&copy; {new Date().getFullYear()} GridCast. All rights reserved.</p>
            </div>
        </footer>
    );
}
