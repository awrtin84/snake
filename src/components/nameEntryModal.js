"use client";
import { useState } from "react";

export default function NameEntryModal({ score, onSubmit }) {
    const [name, setName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(name.trim().slice(0, 12));
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Enter your name"
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
        >
            <form
                onSubmit={handleSubmit}
                className="bg-[#0d2818] border-2 border-lime-500/40 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_60px_rgba(132,255,92,0.25)] flex flex-col gap-4"
            >
                <p className="text-lime-300 font-bold tracking-widest text-lg text-center">
                    SCORE: {score}
                </p>
                <label
                    htmlFor="player-name"
                    className="text-lime-100/70 text-sm"
                >
                    Enter your name for the leaderboard
                </label>
                <input
                    id="player-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={12}
                    autoFocus
                    placeholder="Anonymous"
                    className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-lime-100 placeholder:text-lime-100/30 focus:outline-none focus:border-lime-400"
                />
                <button
                    type="submit"
                    className="px-4 py-2.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-black font-bold transition-colors"
                >
                    Save Score
                </button>
            </form>
        </div>
    );
}
