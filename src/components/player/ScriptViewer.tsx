import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import type { ScriptLine } from '../../lib/mockData';
import { Save, X, Plus, Trash2, Download, Upload, FileJson, FileText } from 'lucide-react';
import { generateJSON, generateSRT, generateVTT, parseJSON, parseSRT, parseVTT } from '../../lib/subtitleUtils';
import { useAuthStore } from '../../store/authStore';

interface ScriptViewerProps {
    script: ScriptLine[];
    currentTime: number;
    onSeek: (time: number) => void;
    isOpen: boolean;
    onClose: () => void;
    onUpdateScript: (newScript: ScriptLine[]) => void;
}

export default function ScriptViewer({ script, currentTime, onSeek, isOpen, onClose, onUpdateScript }: ScriptViewerProps) {
    const activeRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editText, setEditText] = useState("");
    const [editStart, setEditStart] = useState(0);
    const [editEnd, setEditEnd] = useState(0);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const { isPro } = useAuthStore();

    // Scroll active line into view
    useEffect(() => {
        if (activeRef.current && containerRef.current && isOpen && editingIndex === null) {
            activeRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentTime, isOpen, editingIndex]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node) && isOpen) {
                // Don't close if clicking inside the export menu
                const target = event.target as HTMLElement;
                if (target.closest('.export-menu')) return;

                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const startEditing = (index: number, line: ScriptLine) => {
        setEditingIndex(index);
        setEditText(line.text);
        setEditStart(line.start);
        setEditEnd(line.end);
        onSeek(line.start); // Also seek to the start time
    };

    const saveEdit = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newScript = [...script];
        newScript[index] = {
            ...newScript[index],
            text: editText,
            start: Number(editStart),
            end: Number(editEnd)
        };
        newScript.sort((a, b) => a.start - b.start);
        onUpdateScript(newScript);
        setEditingIndex(null);
    };

    const deleteLine = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newScript = script.filter((_, i) => i !== index);
        onUpdateScript(newScript);
        setEditingIndex(null);
    };

    const cancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingIndex(null);
    };

    const addNewLine = () => {
        const lastLine = script[script.length - 1];
        const newStart = lastLine ? lastLine.end : 0;
        const newLine: ScriptLine = {
            start: newStart,
            end: newStart + 2,
            text: "New subtitle line"
        };
        const newScript = [...script, newLine];
        onUpdateScript(newScript);

        // Auto-enter edit mode for the new line
        const newIndex = newScript.length - 1;
        setEditingIndex(newIndex);
        setEditText(newLine.text);
        setEditStart(newLine.start);
        setEditEnd(newLine.end);

        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }, 100);
    };

    const handleExport = (format: 'json' | 'srt' | 'vtt') => {
        let content = '';
        let filename = 'subtitles';
        let type = 'text/plain';

        if (format === 'json') {
            content = generateJSON(script);
            filename += '.json';
            type = 'application/json';
        } else if (format === 'srt') {
            content = generateSRT(script);
            filename += '.srt';
        } else if (format === 'vtt') {
            content = generateVTT(script);
            filename += '.vtt';
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                let newScript: ScriptLine[] = [];

                if (file.name.endsWith('.json')) {
                    newScript = parseJSON(content);
                } else if (file.name.endsWith('.srt')) {
                    newScript = parseSRT(content);
                } else if (file.name.endsWith('.vtt')) {
                    newScript = parseVTT(content);
                } else {
                    throw new Error("Unsupported file format");
                }

                onUpdateScript(newScript);
            } catch (err) {
                console.error("Import failed", err);
                alert("Failed to import script. Invalid format.");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset
    };

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="absolute top-0 right-0 bottom-20 bg-black/95 backdrop-blur-xl border-l border-white/10 z-40 flex flex-col transition-transform duration-300 shadow-2xl rounded-bl-xl"
            style={{ width: 'clamp(250px, 30cqw, 320px)' }}
        >
            <div className="border-b border-white/10 flex justify-between items-center bg-zinc-900/50 rounded-tl-xl p-3">
                <h3 className="text-white font-bold leading-tight text-sm">Transcript Editor</h3>
                <div className="flex items-center gap-1">

                    {/* Import Button */}
                    <label className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md cursor-pointer transition-colors" title="Import JSON">
                        <Upload size={16} />
                        <input
                            type="file"
                            accept=".json,.srt,.vtt"
                            className="hidden"
                            onChange={handleImport}
                        />
                    </label>

                    {/* Export Menu */}
                    <div className="relative export-menu">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className={cn(
                                "p-1.5 rounded-md transition-colors",
                                showExportMenu ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-white hover:bg-white/10"
                            )}
                            title="Export Options"
                        >
                            <Download size={16} />
                        </button>

                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                                <div className="p-2 border-b border-white/5">
                                    <p className="text-xs font-semibold text-zinc-500 uppercase px-2 mb-1">Free Formats</p>
                                    <button
                                        onClick={() => handleExport('json')}
                                        className="w-full text-left px-2 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded flex items-center gap-2"
                                    >
                                        <FileJson size={14} /> JSON (Backup)
                                    </button>
                                </div>
                                <div className="p-2">
                                    <div className="flex items-center justify-between px-2 mb-1">
                                        <p className="text-xs font-semibold text-indigo-400 uppercase">Pro Formats</p>
                                        {!isPro && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1 rounded">PRO</span>}
                                    </div>
                                    <button
                                        onClick={() => isPro ? handleExport('srt') : alert("Upgrade to Pro to export SRT!")}
                                        className={cn(
                                            "w-full text-left px-2 py-1.5 text-sm rounded flex items-center gap-2 transition-colors",
                                            isPro ? "text-zinc-300 hover:text-white hover:bg-white/10" : "text-zinc-600 cursor-not-allowed"
                                        )}
                                    >
                                        <FileText size={14} /> SRT (SubRip)
                                    </button>
                                    <button
                                        onClick={() => isPro ? handleExport('vtt') : alert("Upgrade to Pro to export VTT!")}
                                        className={cn(
                                            "w-full text-left px-2 py-1.5 text-sm rounded flex items-center gap-2 transition-colors",
                                            isPro ? "text-zinc-300 hover:text-white hover:bg-white/10" : "text-zinc-600 cursor-not-allowed"
                                        )}
                                    >
                                        <FileText size={14} /> VTT (WebVTT)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div ref={containerRef} className="flex-1 overflow-y-auto space-y-2 p-3">
                {script.map((line, index) => {
                    const isActive = currentTime >= line.start && currentTime < line.end;
                    const isEditing = editingIndex === index;

                    return (
                        <div
                            key={index}
                            ref={isActive ? activeRef : null}
                            onClick={() => !isEditing && startEditing(index, line)}
                            className={cn(
                                "rounded-lg transition-all duration-200 border",
                                isActive
                                    ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    : "bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/10",
                                isEditing ? "ring-2 ring-blue-500 border-transparent" : "cursor-pointer group"
                            )}
                            style={{ padding: '8px' }}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                    "font-mono px-1.5 py-0.5 rounded text-[10px]",
                                    isActive ? "bg-blue-500/20 text-blue-300" : "bg-zinc-800 text-zinc-500"
                                )}>
                                    {Math.floor(line.start / 60)}:{Math.floor(line.start % 60).toString().padStart(2, '0')}
                                    {' - '}
                                    {Math.floor(line.end / 60)}:{Math.floor(line.end % 60).toString().padStart(2, '0')}
                                </span>

                                {!isEditing && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => deleteLine(index, e)}
                                            className="text-zinc-500 hover:text-red-400 p-1"
                                            title="Delete"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="mt-2 space-y-2">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-zinc-500 block mb-1 text-[10px]">Start</label>
                                            <input
                                                type="number"
                                                value={editStart}
                                                onChange={(e) => setEditStart(Number(e.target.value))}
                                                className="w-full bg-black/50 text-white p-1 rounded border border-white/10 text-xs"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-zinc-500 block mb-1 text-[10px]">End</label>
                                            <input
                                                type="number"
                                                value={editEnd}
                                                onChange={(e) => setEditEnd(Number(e.target.value))}
                                                className="w-full bg-black/50 text-white p-1 rounded border border-white/10 text-xs"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full bg-black/50 text-white p-2 rounded border border-white/10 focus:outline-none focus:border-blue-500 min-h-[60px] text-sm"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex justify-end items-center mt-2 gap-2">
                                        <button
                                            onClick={(e) => cancelEdit(e)}
                                            className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => saveEdit(index, e)}
                                            className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 text-xs"
                                        >
                                            <Save size={12} /> Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className={cn("leading-relaxed text-sm", isActive ? "text-blue-100" : "text-zinc-300")}>
                                    {line.text}
                                </p>
                            )}
                        </div>
                    );
                })}

                <button
                    onClick={addNewLine}
                    className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 font-medium border border-dashed border-white/10 hover:border-white/20 mt-2 text-sm"
                >
                    <Plus size={14} /> Add New Line
                </button>
            </div>
        </div>
    );
}
