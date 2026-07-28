const STORAGE_KEY = "nokia-snake-settings";

export const DEFAULT_SETTINGS = {
    theme: "classic",
    difficulty: "normal",
    soundEnabled: true,
};

export function getSettings() {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
