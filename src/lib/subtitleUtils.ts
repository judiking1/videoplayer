import type { ScriptLine } from './mockData';

// Helper to format time for SRT: HH:MM:SS,mmm
const formatTimeSRT = (seconds: number): string => {
    const date = new Date(0);
    date.setMilliseconds(seconds * 1000);
    const iso = date.toISOString();
    // ISO format: 1970-01-01T00:00:00.000Z
    // We want: 00:00:00,000
    return iso.substr(11, 8) + ',' + iso.substr(20, 3);
};

// Helper to format time for VTT: HH:MM:SS.mmm
const formatTimeVTT = (seconds: number): string => {
    const date = new Date(0);
    date.setMilliseconds(seconds * 1000);
    const iso = date.toISOString();
    // ISO format: 1970-01-01T00:00:00.000Z
    // We want: 00:00:00.000
    return iso.substr(11, 12);
};

export const generateSRT = (script: ScriptLine[]): string => {
    return script.map((line, index) => {
        return `${index + 1}\n${formatTimeSRT(line.start)} --> ${formatTimeSRT(line.end)}\n${line.text}\n`;
    }).join('\n');
};

export const generateVTT = (script: ScriptLine[]): string => {
    return `WEBVTT\n\n` + script.map((line) => {
        return `${formatTimeVTT(line.start)} --> ${formatTimeVTT(line.end)}\n${line.text}\n`;
    }).join('\n');
};

export const generateJSON = (script: ScriptLine[], title: string = 'Untitled'): string => {
    const data = {
        metadata: {
            title,
            createdAt: new Date().toISOString(),
            version: '1.0'
        },
        script
    };
    return JSON.stringify(data, null, 2);
};

export const parseJSON = (jsonString: string): ScriptLine[] => {
    try {
        const parsed = JSON.parse(jsonString);

        // Handle new format
        if (parsed.script && Array.isArray(parsed.script)) {
            return parsed.script.map((item: any) => ({
                start: Number(item.start),
                end: Number(item.end),
                text: String(item.text)
            }));
        }

        // Handle legacy format (key-value)
        // Check if it looks like the old format: keys are "start-end" strings
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            const script: ScriptLine[] = [];
            Object.entries(parsed).forEach(([key, value]) => {
                // Skip metadata if mixed in (though unlikely in legacy)
                if (key === 'metadata') return;

                const parts = key.split('-');
                if (parts.length === 2) {
                    const start = Number(parts[0]);
                    const end = Number(parts[1]);
                    if (!isNaN(start) && !isNaN(end)) {
                        script.push({
                            start,
                            end,
                            text: String(value)
                        });
                    }
                }
            });
            return script.sort((a, b) => a.start - b.start);
        }

        throw new Error("Unknown JSON format");
    } catch (e) {
        console.error("Failed to parse JSON script", e);
        throw e;
    }
};

// Helper to parse time string (HH:MM:SS,mmm or HH:MM:SS.mmm) to seconds
const parseTime = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':');
    if (parts.length < 2) return 0;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const secondsParts = parts[2].split(/[.,]/);
    const seconds = Number(secondsParts[0]);
    const milliseconds = Number(secondsParts[1] || 0);

    return (hours * 3600) + (minutes * 60) + seconds + (milliseconds / 1000);
};

export const parseSRT = (srtString: string): ScriptLine[] => {
    const blocks = srtString.trim().split(/\n\s*\n/);
    const script: ScriptLine[] = [];

    blocks.forEach(block => {
        const lines = block.split('\n');
        if (lines.length < 3) return;

        // Line 1 is index (skip)
        // Line 2 is time range
        const timeLine = lines[1];
        const [startStr, endStr] = timeLine.split(' --> ');

        // Remaining lines are text
        const text = lines.slice(2).join('\n');

        if (startStr && endStr) {
            script.push({
                start: parseTime(startStr),
                end: parseTime(endStr),
                text: text.trim()
            });
        }
    });

    return script;
};

export const parseVTT = (vttString: string): ScriptLine[] => {
    const lines = vttString.trim().split('\n');
    const script: ScriptLine[] = [];
    let currentStart = 0;
    let currentEnd = 0;
    let currentText: string[] = [];
    let isHeader = true;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (isHeader) {
            if (line === '') isHeader = false;
            continue;
        }

        if (line.includes('-->')) {
            if (currentText.length > 0) {
                script.push({
                    start: currentStart,
                    end: currentEnd,
                    text: currentText.join('\n').trim()
                });
                currentText = [];
            }

            const [startStr, endStr] = line.split(' --> ');
            currentStart = parseTime(startStr);
            currentEnd = parseTime(endStr);
        } else if (line !== '' && !/^\d+$/.test(line)) { // Skip empty lines and index numbers if present
            currentText.push(line);
        } else if (line === '' && currentText.length > 0) {
            script.push({
                start: currentStart,
                end: currentEnd,
                text: currentText.join('\n').trim()
            });
            currentText = [];
        }
    }

    // Push last block
    if (currentText.length > 0) {
        script.push({
            start: currentStart,
            end: currentEnd,
            text: currentText.join('\n').trim()
        });
    }

    return script;
};
