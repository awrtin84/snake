export const THEMES = {
    classic: {
        label: "Classic Nokia",
        boardA: "#0d2818",
        boardB: "#123420",
        head: "#7fff5c",
        body: "#4ade80",
        food: "#ff5c5c",
        glow: "rgba(132,255,92,0.35)",
    },
    neon: {
        label: "Neon Purple",
        boardA: "#1a0d2e",
        boardB: "#241540",
        head: "#ff5cf7",
        body: "#a855f7",
        food: "#5cffea",
        glow: "rgba(168,85,247,0.4)",
    },
    amber: {
        label: "Retro Amber",
        boardA: "#2b1d0d",
        boardB: "#3a2712",
        head: "#ffcf5c",
        body: "#f59e0b",
        food: "#ff5c5c",
        glow: "rgba(245,158,11,0.35)",
    },
};

export const DIFFICULTIES = {
    easy: { label: "Easy", speed: 170, hasObstacles: false },
    normal: { label: "Normal", speed: 130, hasObstacles: false },
    hard: { label: "Hard", speed: 95, hasObstacles: true },
};
