"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Locale, translations, TranslationKey } from "./translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, paramsOrFallback?: Record<string, string | number> | string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "korot_preferred_ui_locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "en" || saved === "bn") {
        setLocaleState(saved);
      }
    } catch {
      // Local storage unavailable
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // Local storage unavailable
    }
  };

  const toggleLocale = () => {
    const next = locale === "en" ? "bn" : "en";
    setLocale(next);
  };

  const t = useMemo(() => {
    return (
      key: TranslationKey,
      paramsOrFallback?: Record<string, string | number> | string,
      fallback?: string
    ): string => {
      const dict = translations[locale] || translations.en;
      let text: string =
        dict[key] ||
        translations.en[key] ||
        (typeof paramsOrFallback === "string" ? paramsOrFallback : fallback) ||
        key;

      if (typeof paramsOrFallback === "object" && paramsOrFallback !== null) {
        for (const [k, v] of Object.entries(paramsOrFallback)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }

      return text;
    };
  }, [locale]);

  const value = useMemo(
    () => ({
      locale: mounted ? locale : "en",
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, mounted, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback safe dummy context if used outside provider
    return {
      locale: "en" as Locale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: (
        key: TranslationKey,
        paramsOrFallback?: Record<string, string | number> | string,
        fallback?: string
      ) => {
        let text: string =
          translations.en[key] ||
          (typeof paramsOrFallback === "string" ? paramsOrFallback : fallback) ||
          key;
        if (typeof paramsOrFallback === "object" && paramsOrFallback !== null) {
          for (const [k, v] of Object.entries(paramsOrFallback)) {
            text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
          }
        }
        return text;
      },
    };
  }
  return context;
}
