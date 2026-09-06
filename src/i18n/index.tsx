import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { formatMessage } from "./format";

// Every JSON file dropped into content/strings/ is picked up automatically —
// adding a language is a matter of adding a file, no code change.
const modules = import.meta.glob("../../content/strings/*.json", { eager: true }) as Record<
  string,
  { default: StringsShape }
>;

interface StringsShape {
  meta: { language: string; dir: "ltr" | "rtl"; label: string };
  [key: string]: unknown;
}

interface LanguageInfo {
  code: string;
  label: string;
  dir: "ltr" | "rtl";
  strings: StringsShape;
}

const languages: LanguageInfo[] = Object.values(modules)
  .map((m) => m.default)
  .map((strings) => ({
    code: strings.meta.language,
    label: strings.meta.label,
    dir: strings.meta.dir,
    strings
  }))
  .sort((a, b) => (a.code === "en" ? -1 : b.code === "en" ? 1 : a.code.localeCompare(b.code)));

const STORAGE_KEY = "otr.language";

function getByPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

interface I18nContextValue {
  language: string;
  dir: "ltr" | "rtl";
  languages: { code: string; label: string }[];
  setLanguage: (code: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  list: (key: string) => string[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLanguage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && languages.some((l) => l.code === stored)) return stored;
  } catch {
    // localStorage unavailable (private mode, policy) — fall through.
  }
  return languages[0]?.code ?? "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(readStoredLanguage);

  const current = languages.find((l) => l.code === language) ?? languages[0];

  useEffect(() => {
    document.documentElement.lang = current.code;
    document.documentElement.dir = current.dir;
  }, [current]);

  const setLanguage = (code: string) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // best-effort only
    }
  };

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string, params?: Record<string, string | number>) => {
      const template = getByPath(current.strings, key);
      if (typeof template !== "string") {
        return key;
      }
      return params ? formatMessage(template, params, current.code) : template;
    };
    const list = (key: string): string[] => {
      const value = getByPath(current.strings, key);
      return Array.isArray(value) ? (value as string[]) : [];
    };
    return {
      language: current.code,
      dir: current.dir,
      languages: languages.map((l) => ({ code: l.code, label: l.label })),
      setLanguage,
      t,
      list
    };
  }, [current]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
