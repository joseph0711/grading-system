"use client";

import { createContext, useContext, useState, useEffect } from "react";
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

  // Handle initial theme and language
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedLanguage = localStorage.getItem("language") as Language | null;

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const initialTheme = savedTheme || systemTheme;
    const initialLanguage = savedLanguage || "en";

    setTheme(initialTheme);
    setLanguage(initialLanguage);

    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(initialTheme);

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.classList.add("transitioning");
    setTheme(newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
    }, 200);
  };

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
        t: translations[language] as typeof translations['en'],
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
