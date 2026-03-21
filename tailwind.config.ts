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
        black: "#0A0A0A",
        "black-2": "#111111",
        "black-3": "#1A1A1A",
        white: "#FFFFFF",
        gray: {
          DEFAULT: "#F4F4F5",
          2: "#EEEEEE",
        },
        border: "#E4E4E7",
        muted: "#888888",
        text2: "#444444",
        accent: "#2563EB",
        green: "#16A34A",
        amber: "#D97706",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      screens: {
        md2: "960px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
