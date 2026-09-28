"use client";
import { useEffect, useState } from "react";
import { THEMES, DIFFICULTIES, MODES } from "@/lib/themes";
import { DEFAULT_SETTINGS } from "@/lib/settingsStorage";

function optionClass(active) {
    return `flex-1 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
        active
            ? "border-lime-400 bg-lime-500/10 text-lime-300"
            : "border-white/10 bg-white/5 hover:bg-white/10 text-lime-100/70"
    }`;
}

export default function SettingsMenu({ settings, onUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState(settings);

    useEffect(() => {
        if (isOpen) setDraft(settings);
    }, [isOpen, settings]);

    const handleSave = () => {
        onUpdate({ ...draft, playerName: (draft.playerName ?? "").trim() });
        setIsOpen(false);
    };

    const handleReset = () => {
        setDraft(DEFAULT_SETTINGS);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                aria-haspopup="dialog"
                aria-label="Open settings"
                className="flex items-center gap-2 px-6 py-2.5 bg-black/40 hover:bg-black/60 border border-lime-500/40 rounded-lg text-lime-300 font-bold tracking-wide transition-colors"
            >
                ⚙️ Settings
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Settings"
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-[#0d2818] border-2 border-lime-500/40 rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(132,255,92,0.25)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lime-300 font-bold tracking-widest text-lg">
                                ⚙️ SETTINGS
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                                className="text-lime-300/60 hover:text-lime-300 text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-5">
                            <label
                                htmlFor="player-name"
                                className="block text-lime-100/60 text-sm font-bold mb-2"
                            >
                                Player name
                            </label>
                            <input
                                id="player-name"
                                type="text"
                                value={draft.playerName ?? ""}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        playerName: e.target.value.slice(0, 12),
                                    }))
                                }
                                maxLength={12}
                                placeholder="Anonymous"
                                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-lime-100 placeholder:text-lime-100/30 focus:outline-none focus:border-lime-400"
                            />
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
                                Mode
                            </p>
                            <div className="flex gap-2">
                                {Object.entries(MODES).map(([key, mode]) => (
                                    <button
                                        key={key}
                                        onClick={() =>
                                            setDraft((d) => ({
                                                ...d,
                                                mode: key,
                                            }))
                                        }
                                        className={optionClass(
                                            draft.mode === key,
                                        )}
                                    >
                                        {mode.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-lime-100/40 text-xs mt-2">
                                Free World: no walls, exit one side and appear
                                on the opposite side
                            </p>
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
                                            className={optionClass(
                                                draft.difficulty === key,
                                            )}
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
                                        className={optionClass(
                                            draft.soundEnabled === value,
                                        )}
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
