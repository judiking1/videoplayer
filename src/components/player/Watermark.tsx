interface WatermarkProps {
    isPro?: boolean;
}

export default function Watermark({ isPro = false }: WatermarkProps) {
    if (isPro) return null;

    return (
        <div
            className="absolute top-6 right-6 z-30 pointer-events-none select-none"
        >
            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg shadow-xl">
                <span className="text-white/70 font-bold text-lg tracking-wide">
                    Made with <span className="text-blue-400">GridCast</span>
                </span>
            </div>
        </div>
    );
}
