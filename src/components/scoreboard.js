"use client";
import { useEffect, useState } from "react";
import { getHighScores, getStats } from "@/lib/scoreStorage";

export default function Scoreboard({ refreshKey }) {
    const [scores, setScores] = useState([]);
    const [stats, setStats] = useState({
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setScores(getHighScores());
        setStats(getStats());
    }, [refreshKey]);

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
                className="flex items-center gap-2 px-6 py-2.5 bg-black/40 hover:bg-black/60 border border-lime-500/40 rounded-lg text-lime-300 font-bold tracking-wide transition-colors"
            >
                🏆 High Scores
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="High scores"
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-[#0d2818] border-2 border-lime-500/40 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_60px_rgba(132,255,92,0.25)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lime-300 font-bold tracking-widest text-lg">
                                🏆 HIGH SCORES
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                                className="text-lime-300/60 hover:text-lime-300 text-xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-5">
                            <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                <p className="text-lime-100/50 text-xs mb-1">
                                    Games
                                </p>
                                <p className="text-lime-300 font-bold text-lg">
                                    {stats.gamesPlayed}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                <p className="text-lime-100/50 text-xs mb-1">
                                    Average
                                </p>
                                <p className="text-lime-300 font-bold text-lg">
                                    {averageScore}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-2.5 text-center">
                                <p className="text-lime-100/50 text-xs mb-1">
                                    Best
                                </p>
                                <p className="text-lime-300 font-bold text-lg">
                                    {stats.bestScore}
                                </p>
                            </div>
                        </div>

                        {scores.length === 0 ? (
                            <p className="text-lime-100/50 text-sm text-center py-6">
                                No scores yet
                            </p>
                        ) : (
                            <ol className="flex flex-col gap-2">
                                {scores.map((entry, index) => (
                                    <li
                                        key={entry.date}
                                        className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5"
                                    >
                                        <span className="text-lime-400 font-bold w-6">
                                            {index + 1}
                                        </span>
                                        <span className="text-lime-100 text-sm flex-1 px-2 truncate">
                                            {entry.name || "Anonymous"}
                                        </span>
                                        <span className="text-lime-100 font-bold text-lg">
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
