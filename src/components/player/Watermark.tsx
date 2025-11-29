export default function Watermark() {
    return (
        <div className="absolute top-4 right-4 z-30 pointer-events-none select-none opacity-50 mix-blend-screen">
            <p className="font-black text-white tracking-tighter drop-shadow-lg" style={{ fontSize: 'clamp(12px, 3cqw, 24px)' }}>
                GridCast
            </p>
        </div>
    );
}
