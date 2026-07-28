"use client";
import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "@/lib/settingsStorage";

export function useSettings() {
    const [settings, setSettings] = useState({
        theme: "classic",
        difficulty: "normal",
    });

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
