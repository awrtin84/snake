const SCORES_KEY = "nokia-snake-highscores";
const STATS_KEY = "nokia-snake-stats";
const MAX_SCORES = 5;

export function getHighScores() {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function getStats() {
    if (typeof window === "undefined") {
        return { gamesPlayed: 0, totalScore: 0, bestScore: 0 };
    }
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { gamesPlayed: 0, totalScore: 0, bestScore: 0 };
    try {
        return JSON.parse(raw);
    } catch {
        return { gamesPlayed: 0, totalScore: 0, bestScore: 0 };
    }
}

export function saveScore(score, name) {
    const scores = getHighScores();
    const updated = [...scores, { score, name, date: Date.now() }]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SCORES);
    localStorage.setItem(SCORES_KEY, JSON.stringify(updated));

    const stats = getStats();
    const nextStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        totalScore: stats.totalScore + score,
        bestScore: Math.max(stats.bestScore, score),
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(nextStats));

    return { scores: updated, stats: nextStats };
}
