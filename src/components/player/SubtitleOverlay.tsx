import type { ScriptLine } from '../../lib/mockData';

interface SubtitleOverlayProps {
    script: ScriptLine[];
    currentTime: number;
}

export default function SubtitleOverlay({ script, currentTime }: SubtitleOverlayProps) {
    const currentLine = script.find(
        (line) => currentTime >= line.start && currentTime < line.end
    );

    if (!currentLine) return null;

    return (
        <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none z-20 px-4">
            <span className="inline-block bg-black/60 text-white text-lg md:text-xl font-medium px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                {currentLine.text}
            </span>
        </div>
    );
}
