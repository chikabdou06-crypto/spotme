import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        volt: {
          DEFAULT: "#CCFF00",
          400: "#D6FF33",
          500: "#CCFF00",
          600: "#A3CC00",
        },
        cyber: {
          DEFAULT: "#00F0FF",
          500: "#00F0FF",
        },
        flame: {
          DEFAULT: "#FF3B5C",
          500: "#FF3B5C",
        },
        obsidian: {
          950: "#07090E",
          900: "#0B0F17",
          800: "#131926",
          700: "#1C2536",
          600: "#28344B",
        },
      },
      keyframes: {
        "float-bubble": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "radar-ping": {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "70%": { transform: "scale(1.9)", opacity: "0" },
          "100%": { transform: "scale(2.1)", opacity: "0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "float-bubble": "float-bubble 3s ease-in-out infinite",
        "radar-ping": "radar-ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "slide-up": "slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
