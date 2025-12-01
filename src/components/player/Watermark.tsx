import { useAuthStore } from '../../store/authStore';

export default function Watermark() {
    const { isPro } = useAuthStore();

    if (isPro) return null;

    return (
        <div className="absolute top-4 right-4 z-30 pointer-events-none select-none opacity-50 mix-blend-screen">
            <p className="font-black text-white tracking-tighter drop-shadow-lg" style={{ fontSize: 'clamp(12px, 3cqw, 24px)' }}>
                GridCast
            </p>
        </div>
    );
}
