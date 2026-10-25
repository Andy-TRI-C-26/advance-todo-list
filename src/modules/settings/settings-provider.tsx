"use client";
import { createContext, useContext, type ReactNode } from "react";
import { usePersistentState } from "@/shared/hooks/use-persistent-state";
import { STORAGE_KEYS } from "@/shared/lib/storage-keys";
import type { Settings } from "./types";

const DEFAULT_SETTINGS: Settings = {
  name: "Mahasiswa",
  sleepStart: "22:00",
  sleepEnd: "05:00",
  dark: false,
  driveConnected: false,
};

// Gabungkan data tersimpan dengan nilai default (berguna jika nanti ada field baru).
const normalize = (stored: unknown): Settings | undefined =>
  stored && typeof stored === "object"
    ? { ...DEFAULT_SETTINGS, ...(stored as Partial<Settings>) }
    : undefined;

type SettingsContextValue = {
  ready: boolean;
  settings: Settings;
  /** Ubah sebagian pengaturan, contoh: updateSettings({ dark: true }) */
  updateSettings: (changes: Partial<Settings>) => void;
  /** Ganti seluruh pengaturan (dipakai saat memulihkan backup). */
  replaceSettings: (settings: Settings) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings harus di dalam <SettingsProvider>");
  return ctx;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings, ready] = usePersistentState<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
    normalize,
  );

  const value: SettingsContextValue = {
    ready,
    settings,
    updateSettings: (changes) => setSettings((s) => ({ ...s, ...changes })),
    replaceSettings: (next) => setSettings({ ...DEFAULT_SETTINGS, ...next }),
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
