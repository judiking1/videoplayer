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
        <div className="absolute bottom-16 left-0 right-0 z-30 flex justify-center pointer-events-none px-8">
            <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-center shadow-lg max-w-[80%]">
                <p
                    className="text-white font-medium leading-relaxed drop-shadow-md whitespace-nowrap"
                    style={{ fontSize: 'clamp(10px, 2.5cqw, 24px)' }}
                >
                    {currentLine.text}
                </p>
            </div>
        </div>
    );
}
