import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#06150e",
          900: "#0a2217",
          850: "#0e2c1e",
          800: "#133a28",
          700: "#1b5239",
          600: "#256f4d",
        },
        cream: {
          50: "#fbfcf8",
          100: "#f6f8f0",
          200: "#ebf0df",
          300: "#dde6c8",
          800: "#606b52",
          900: "#363d2c",
        },
        lime: {
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
          accent: "#99f228",
        },
      },
    },
  },
  plugins: [],
};
export default config;
