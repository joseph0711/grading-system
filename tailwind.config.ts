import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        shimmer: {
          "0%": {
            backgroundPosition: "100% 0",
          },
          "100%": {
            backgroundPosition: "-100% 0",
          },
        },
        wave: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        shimmer: "shimmer 3s infinite linear",
        wave: "wave 2s infinite",
        fadeIn: "fadeIn 1s ease-out forwards",
      },
      backgroundSize: {
        "200%": "200% 100%",
      },
    },
  },
  plugins: [],
};

export default config;
