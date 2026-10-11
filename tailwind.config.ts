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
        paper: "var(--color-paper)",
        panel: "var(--color-panel)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        signal: "var(--color-signal)",
        live: "var(--color-live)",
        line: "var(--color-line)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "1080px",
        cv: "820px",
      },
      keyframes: {
        "pipeline-in": {
          "0%": { opacity: "0", transform: "translateX(-4px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "pipeline-in": "pipeline-in 0.4s ease forwards",
        pulse: "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
