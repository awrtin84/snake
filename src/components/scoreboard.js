"use client";
import { useEffect, useState } from "react";
import { getHighScores, getStats } from "@/lib/scoreStorage";
import { MODES } from "@/lib/themes";

export default function Scoreboard({ refreshKey, defaultMode }) {
    const [activeMode, setActiveMode] = useState(defaultMode);
    const [scores, setScores] = useState([]);
    const [stats, setStats] = useState({
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) setActiveMode(defaultMode);
    }, [isOpen, defaultMode]);

    useEffect(() => {
        setScores(getHighScores(activeMode));
        setStats(getStats(activeMode));
    }, [refreshKey, activeMode]);

    const averageScore =
        stats.gamesPlayed > 0
            ? Math.round(stats.totalScore / stats.gamesPlayed)
            : 0;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                aria-haspopup="dialog"
                aria-label="Open high scores"
                className="btn-chrome"
            >
                🏆 High Scores
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="High scores"
                    className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 px-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="modal-shell rounded-2xl p-6 w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-extrabold tracking-widest text-lg">
                                🏆 HIGH SCORES
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                                className="text-white/50 hover:text-white text-xl leading-none transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex gap-2 mb-4">
                            {Object.entries(MODES).map(([key, mode]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveMode(key)}
                                    className={`option-pill flex-1 px-3 py-2 text-sm font-semibold ${
                                        activeMode === key ? "active" : ""
                                    }`}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-5">
                            <div className="rounded-xl p-2.5 text-center bg-white/5 border border-white/10">
                                <p className="text-white/40 text-xs mb-1 tracking-wide">
                                    GAMES
                                </p>
                                <p className="text-white font-bold text-lg">
                                    {stats.gamesPlayed}
                                </p>
                            </div>
                            <div className="rounded-xl p-2.5 text-center bg-white/5 border border-white/10">
                                <p className="text-white/40 text-xs mb-1 tracking-wide">
                                    AVERAGE
                                </p>
                                <p className="text-white font-bold text-lg">
                                    {averageScore}
                                </p>
                            </div>
                            <div className="rounded-xl p-2.5 text-center bg-white/5 border border-white/10">
                                <p className="text-white/40 text-xs mb-1 tracking-wide">
                                    BEST
                                </p>
                                <p className="text-white font-bold text-lg">
                                    {stats.bestScore}
                                </p>
                            </div>
                        </div>

                        {scores.length === 0 ? (
                            <p className="text-white/40 text-sm text-center py-6">
                                No scores yet
                            </p>
                        ) : (
                            <ol className="flex flex-col gap-2">
                                {scores.map((entry, index) => (
                                    <li
                                        key={entry.date}
                                        className="flex items-center justify-between rounded-xl px-4 py-2.5 bg-white/5 border border-white/10"
                                    >
                                        <span
                                            className="font-extrabold w-6"
                                            style={{
                                                color: "var(--accent, #7fff5c)",
                                            }}
                                        >
                                            {index + 1}
                                        </span>
                                        <span className="text-white/90 text-sm flex-1 px-2 truncate">
                                            {entry.name || "Anonymous"}
                                        </span>
                                        <span className="text-white font-bold text-lg">
                                            {entry.score}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
