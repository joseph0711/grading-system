"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { translations } from "../translations";

type Theme = "light" | "dark";
type Language = "en" | "zh";

interface SettingsContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [hasUserSetTheme, setHasUserSetTheme] = useState(false);

  // Handle initial theme and language
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedLanguage = localStorage.getItem("language") as Language | null;
    const hasUserThemePreference =
      localStorage.getItem("hasUserSetTheme") === "true";

    if (typeof window !== "undefined") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      if (hasUserThemePreference && savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme(systemTheme);
      }

      setLanguage(savedLanguage || "en");
      setHasUserSetTheme(hasUserThemePreference);
      setMounted(true);
    }
  }, []);

  // Apply theme effect
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
    }
  }, [theme, mounted]);

  // System theme change listener
  useEffect(() => {
    if (mounted && !hasUserSetTheme && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () =>
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, [mounted, hasUserSetTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setHasUserSetTheme(true);
    localStorage.setItem("theme", newTheme);
    localStorage.setItem("hasUserSetTheme", "true");
  }, [theme]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  if (!mounted) return null;

  return (
    <SettingsContext.Provider
      value={{
        theme,
        language,
        toggleTheme,
        setLanguage: handleSetLanguage,
        t: translations[language] as (typeof translations)["en"],
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
