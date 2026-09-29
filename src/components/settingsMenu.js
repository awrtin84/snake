"use client";
import { useEffect, useState } from "react";
import { THEMES, DIFFICULTIES, MODES } from "@/lib/themes";
import { DEFAULT_SETTINGS } from "@/lib/settingsStorage";

function pillClass(active) {
    return `option-pill flex-1 px-3 py-2.5 text-sm font-semibold ${active ? "active" : ""}`;
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
                className="btn-chrome"
            >
                ⚙️ Settings
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Settings"
                    className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 px-4 py-8"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="modal-shell rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-2xl max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-white font-extrabold tracking-widest text-lg sm:text-xl">
                                ⚙️ SETTINGS
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                                className="text-white/50 hover:text-white text-xl leading-none transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="player-name"
                                className="block text-white/50 text-xs font-bold tracking-wide mb-2"
                            >
                                PLAYER NAME
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
                                className="field-input w-full sm:max-w-xs"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-6">
                            <div>
                                <p className="text-white/50 text-xs font-bold tracking-wide mb-3">
                                    THEME
                                </p>
                                <div className="flex flex-col gap-2">
                                    {Object.entries(THEMES).map(
                                        ([key, theme]) => (
                                            <button
                                                key={key}
                                                onClick={() =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        theme: key,
                                                    }))
                                                }
                                                className={`option-pill flex items-center gap-3 px-4 py-2.5 ${
                                                    draft.theme === key
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <span
                                                    className="w-4 h-4 rounded-full shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            theme.head,
                                                    }}
                                                />
                                                <span className="text-sm font-semibold">
                                                    {theme.label}
                                                </span>
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-white/50 text-xs font-bold tracking-wide mb-3">
                                        MODE
                                    </p>
                                    <div className="flex gap-2">
                                        {Object.entries(MODES).map(
                                            ([key, mode]) => (
                                                <button
                                                    key={key}
                                                    onClick={() =>
                                                        setDraft((d) => ({
                                                            ...d,
                                                            mode: key,
                                                        }))
                                                    }
                                                    className={pillClass(
                                                        draft.mode === key,
                                                    )}
                                                >
                                                    {mode.label}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                    <p className="text-white/30 text-xs mt-2 leading-relaxed">
                                        Free World: no walls, exit one side and
                                        appear on the opposite side
                                    </p>
                                </div>

                                <div>
                                    <p className="text-white/50 text-xs font-bold tracking-wide mb-3">
                                        DIFFICULTY
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
                                                    className={pillClass(
                                                        draft.difficulty ===
                                                            key,
                                                    )}
                                                >
                                                    {difficulty.label}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-white/50 text-xs font-bold tracking-wide mb-3">
                                        SOUND
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
                                                className={pillClass(
                                                    draft.soundEnabled ===
                                                        value,
                                                )}
                                            >
                                                {value ? "On" : "Off"}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 sm:justify-end sm:max-w-xs sm:ml-auto">
                            <button
                                onClick={handleReset}
                                className="option-pill flex-1 px-4 py-2.5 text-sm font-bold"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-solid flex-1 text-sm py-2.5"
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
