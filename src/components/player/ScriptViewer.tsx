import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import type { ScriptLine } from '../../lib/mockData';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';

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
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const startEditing = (index: number, line: ScriptLine, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingIndex(index);
        setEditText(line.text);
        setEditStart(line.start);
        setEditEnd(line.end);
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

        setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }, 100);
    };

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="absolute top-0 right-0 bottom-24 w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 z-40 flex flex-col transition-transform duration-300 shadow-2xl rounded-bl-xl"
        >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 rounded-tl-xl">
                <div>
                    <h3 className="text-white font-bold text-lg">Transcript Editor</h3>
                    <p className="text-xs text-zinc-400">Click pencil to edit time & text</p>
                </div>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {script.map((line, index) => {
                    const isActive = currentTime >= line.start && currentTime < line.end;
                    const isEditing = editingIndex === index;

                    return (
                        <div
                            key={index}
                            ref={isActive ? activeRef : null}
                            onClick={() => !isEditing && onSeek(line.start)}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-200 border",
                                isActive
                                    ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                    : "bg-zinc-900/50 border-white/5 hover:bg-white/5 hover:border-white/10",
                                isEditing ? "ring-2 ring-blue-500 border-transparent" : "cursor-pointer group"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn(
                                    "text-xs font-mono px-1.5 py-0.5 rounded",
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
                                            <Trash2 size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => startEditing(index, line, e)}
                                            className="text-zinc-500 hover:text-white p-1"
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="mt-2 space-y-2">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-zinc-500 block mb-1">Start (sec)</label>
                                            <input
                                                type="number"
                                                value={editStart}
                                                onChange={(e) => setEditStart(Number(e.target.value))}
                                                className="w-full bg-black/50 text-white p-1 rounded border border-white/10 text-xs"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-zinc-500 block mb-1">End (sec)</label>
                                            <input
                                                type="number"
                                                value={editEnd}
                                                onChange={(e) => setEditEnd(Number(e.target.value))}
                                                className="w-full bg-black/50 text-white p-1 rounded border border-white/10 text-xs"
                                            />
                                        </div>
                                    </div>
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full bg-black/50 text-white p-2 rounded border border-white/10 focus:outline-none focus:border-blue-500 text-sm min-h-[60px]"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex justify-end items-center mt-2 gap-2">
                                        <button
                                            onClick={(e) => cancelEdit(e)}
                                            className="px-3 py-1 text-xs rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={(e) => saveEdit(index, e)}
                                            className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            <Save size={12} /> Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className={cn("text-sm leading-relaxed", isActive ? "text-blue-100" : "text-zinc-300")}>
                                    {line.text}
                                </p>
                            )}
                        </div>
                    );
                })}

                <button
                    onClick={addNewLine}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium border border-dashed border-white/10 hover:border-white/20 mt-2"
                >
                    <Plus size={16} /> Add New Line
                </button>
            </div>
        </div>
    );
}
