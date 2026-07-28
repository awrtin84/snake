"use client";
import { useEffect, useState } from "react";
import { THEMES, DIFFICULTIES } from "@/lib/themes";
import { DEFAULT_SETTINGS } from "@/lib/settingsStorage";

export default function SettingsMenu({ settings, onUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState(settings);

    useEffect(() => {
        if (isOpen) setDraft(settings);
    }, [isOpen, settings]);

    const handleSave = () => {
        onUpdate(draft);
        setIsOpen(false);
    };

    const handleReset = () => {
        setDraft(DEFAULT_SETTINGS);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-black/40 hover:bg-black/60 border border-lime-500/40 rounded-lg text-lime-300 font-bold tracking-wide transition-colors"
            >
                ⚙️ Settings
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-[#0d2818] border-2 border-lime-500/40 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_60px_rgba(132,255,92,0.25)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lime-300 font-bold tracking-widest text-lg">
                                ⚙️ SETTINGS
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-lime-300/60 hover:text-lime-300 text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-5">
                            <p className="text-lime-100/60 text-sm font-bold mb-2">
                                Theme
                            </p>
                            <div className="flex flex-col gap-2">
                                {Object.entries(THEMES).map(([key, theme]) => (
                                    <button
                                        key={key}
                                        onClick={() =>
                                            setDraft((d) => ({
                                                ...d,
                                                theme: key,
                                            }))
                                        }
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors ${
                                            draft.theme === key
                                                ? "border-lime-400 bg-lime-500/10"
                                                : "border-white/10 bg-white/5 hover:bg-white/10"
                                        }`}
                                    >
                                        <span
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor: theme.head,
                                            }}
                                        />
                                        <span className="text-lime-100 text-sm">
                                            {theme.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-5">
                            <p className="text-lime-100/60 text-sm font-bold mb-2">
                                Difficulty
                            </p>
                            <div className="flex gap-2">
                                {Object.entries(DIFFICULTIES).map(
                                    ([key, difficulty]) => (
                                        <button
                                            key={key}
                                            onClick={() =>
                                                setDraft((d) => ({
                                                    ...d,
                                                    difficulty: key,
                                                }))
                                            }
                                            className={`flex-1 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                                                draft.difficulty === key
                                                    ? "border-lime-400 bg-lime-500/10 text-lime-300"
                                                    : "border-white/10 bg-white/5 hover:bg-white/10 text-lime-100/70"
                                            }`}
                                        >
                                            {difficulty.label}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-lime-100/60 text-sm font-bold mb-2">
                                Sound
                            </p>
                            <div className="flex gap-2">
                                {[true, false].map((value) => (
                                    <button
                                        key={String(value)}
                                        onClick={() =>
                                            setDraft((d) => ({
                                                ...d,
                                                soundEnabled: value,
                                            }))
                                        }
                                        className={`flex-1 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                                            draft.soundEnabled === value
                                                ? "border-lime-400 bg-lime-500/10 text-lime-300"
                                                : "border-white/10 bg-white/5 hover:bg-white/10 text-lime-100/70"
                                        }`}
                                    >
                                        {value ? "On" : "Off"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-lime-100/70 text-sm font-bold transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-black text-sm font-bold transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
