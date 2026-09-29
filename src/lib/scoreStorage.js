const SCORES_PREFIX = "nokia-snake-highscores-";
const STATS_PREFIX = "nokia-snake-stats-";
const MAX_SCORES = 5;

export function getHighScores(mode) {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(SCORES_PREFIX + mode);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function getStats(mode) {
    if (typeof window === "undefined") {
        return { gamesPlayed: 0, totalScore: 0, bestScore: 0 };
    }
    const raw = localStorage.getItem(STATS_PREFIX + mode);
    if (!raw) return { gamesPlayed: 0, totalScore: 0, bestScore: 0 };
    try {
        return JSON.parse(raw);
    } catch {
        return { gamesPlayed: 0, totalScore: 0, bestScore: 0 };
    }
}

export function saveScore(score, name, mode) {
    const scores = getHighScores(mode);
    const updated = [...scores, { score, name, date: Date.now() }]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SCORES);
    localStorage.setItem(SCORES_PREFIX + mode, JSON.stringify(updated));

    const stats = getStats(mode);
    const nextStats = {
        gamesPlayed: stats.gamesPlayed + 1,
        totalScore: stats.totalScore + score,
        bestScore: Math.max(stats.bestScore, score),
    };
    localStorage.setItem(STATS_PREFIX + mode, JSON.stringify(nextStats));

    return { scores: updated, stats: nextStats };
}
