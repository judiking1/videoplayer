export interface ScriptLine {
    start: number;
    end: number;
    text: string;
}

export const MOCK_SCRIPT: ScriptLine[] = [
    { start: 0, end: 2, text: "Welcome to GridCast Video Editor." },
    { start: 2, end: 4, text: "You can edit these subtitles easily." },
    { start: 4, end: 6, text: "Try exporting your video now!" },
];
