import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080d0b",
        surface: {
          DEFAULT: "#0e1713",
          elevated: "#15221c",
          border: "rgba(204, 213, 174, 0.12)",
          glass: "rgba(14, 23, 19, 0.75)",
        },
        forest: {
          950: "#04150e",
          900: "#01472e",
          800: "#065f3e",
          700: "#0a7a50",
          600: "#0f9964",
        },
        lime: {
          DEFAULT: "#cbff00",
          glow: "rgba(203, 255, 0, 0.25)",
          hover: "#b8e600",
        },
        sage: {
          DEFAULT: "#ccd5ae",
          muted: "rgba(204, 213, 174, 0.65)",
        },
        olive: "#e9edc9",
        cream: "#fefae0",
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2.5rem": "2.5rem",
        "3rem": "3rem",
        "5rem": "5rem",
      },
      boxShadow: {
        forest: "0 25px 50px -12px rgba(1, 71, 46, 0.35)",
        lime: "0 0 35px -5px rgba(203, 255, 0, 0.3)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
