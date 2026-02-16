"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ── preference shape ──────────────────────────────────────────────── */

export interface UserPreferences {
  /** true = 24-hour clock, false = 12-hour (default) */
  use24h: boolean;
  /** ID of the schedule type to default to (empty = auto-detect) */
  defaultScheduleId: string;
  /** If true, show weekends in week view */
  showWeekends: boolean;
}

const DEFAULTS: UserPreferences = {
  use24h: false,
  defaultScheduleId: "",
  showWeekends: false,
};

const STORAGE_KEY = "blockly-prefs";

/* ── context ───────────────────────────────────────────────────────── */

interface PreferencesContextValue {
  prefs: UserPreferences;
  setPref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS);

  /* hydrate from localStorage once on mount */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UserPreferences>;
        setPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  /* persist on change */
  const setPref = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* quota */ }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ prefs, setPref }), [prefs, setPref]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be inside PreferencesProvider");
  return ctx;
}

/* ── shared time formatter ─────────────────────────────────────────── */

/** Format a "HH:MM" or "HH:MM:SS" string respecting user preference */
export function formatTime(time: string, use24h: boolean): string {
  const [h, m] = time.split(":").map(Number);
  if (use24h) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}
