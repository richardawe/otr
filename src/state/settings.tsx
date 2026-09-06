import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { TextSize } from "../types";

interface Settings {
  textSize: TextSize;
  reducedMotion: boolean;
  highContrast: boolean;
  educatorMode: boolean;
}

const DEFAULTS: Settings = {
  textSize: "default",
  reducedMotion: false,
  highContrast: false,
  educatorMode: false
};

const STORAGE_KEY = "otr.settings";

const TEXT_SCALE: Record<TextSize, number> = {
  small: 0.9,
  default: 1,
  large: 1.25,
  xlarge: 1.6
};

function readStored(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    // ignore — private mode or corrupted value
  }
  return DEFAULTS;
}

interface SettingsContextValue extends Settings {
  setTextSize: (size: TextSize) => void;
  setReducedMotion: (on: boolean) => void;
  setHighContrast: (on: boolean) => void;
  setEducatorMode: (on: boolean) => void;
  systemPrefersReducedMotion: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(readStored);
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // best-effort only
    }
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--text-scale", String(TEXT_SCALE[settings.textSize]));
    root.dataset.contrast = settings.highContrast ? "high" : "standard";
    root.dataset.motion =
      settings.reducedMotion || systemPrefersReducedMotion ? "reduced" : "full";
  }, [settings, systemPrefersReducedMotion]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...settings,
      systemPrefersReducedMotion,
      setTextSize: (textSize) => setSettings((s) => ({ ...s, textSize })),
      setReducedMotion: (reducedMotion) => setSettings((s) => ({ ...s, reducedMotion })),
      setHighContrast: (highContrast) => setSettings((s) => ({ ...s, highContrast })),
      setEducatorMode: (educatorMode) => setSettings((s) => ({ ...s, educatorMode }))
    }),
    [settings, systemPrefersReducedMotion]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
