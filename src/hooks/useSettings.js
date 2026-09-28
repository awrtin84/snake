"use client";
import { useEffect, useState } from "react";
import {
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
} from "@/lib/settingsStorage";

export function useSettings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    useEffect(() => {
        setSettings(getSettings());
    }, []);

    const updateSettings = (partial) => {
        setSettings((prev) => {
            const next = { ...prev, ...partial };
            saveSettings(next);
            return next;
        });
    };

    return { settings, updateSettings };
}
