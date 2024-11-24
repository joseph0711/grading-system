"use client";

import { useSettings } from "../contexts/SettingsContext";
import { MoonIcon, SunIcon, LanguageIcon } from "@heroicons/react/24/outline";

export default function SettingsButtons() {
  const { theme, language, toggleTheme, setLanguage } = useSettings();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      <div className="relative">
        <button
          onClick={() => setLanguage(language === "en" ? "zh" : "en")}
          className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors text-gray-600 dark:text-gray-300"
        >
          <LanguageIcon className="h-5 w-5" />
          <span className="text-sm font-medium">{language.toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
}
