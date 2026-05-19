import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bridge: {
          night: "#0f1419",
          charcoal: "#1a2332",
          amber: "#e8a87c",
          cream: "#f5f0e8",
          muted: "#8b9aab",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        orbSpeakPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.07)" },
        },
        orbCoreBreathe: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: "0.75" },
          "50%": { transform: "translate(-50%, -50%) scale(1.12)", opacity: "0.95" },
        },
        orbCoreTalk: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: "0.9" },
          "50%": { transform: "translate(-50%, -50%) scale(1.35)", opacity: "1" },
        },
        orbFlow1: {
          "0%, 100%": {
            transform: "translate(-12%, -8%) rotate(0deg) scale(1)",
            borderRadius: "58% 42% 52% 48% / 48% 52% 42% 58%",
          },
          "33%": {
            transform: "translate(14%, 6%) rotate(120deg) scale(1.12)",
            borderRadius: "42% 58% 48% 52% / 55% 45% 58% 42%",
          },
          "66%": {
            transform: "translate(4%, 16%) rotate(240deg) scale(0.94)",
            borderRadius: "52% 48% 58% 42% / 42% 58% 48% 52%",
          },
        },
        orbFlow2: {
          "0%, 100%": {
            transform: "translate(10%, 12%) rotate(0deg) scale(1.05)",
            borderRadius: "48% 52% 42% 58% / 58% 42% 52% 48%",
          },
          "33%": {
            transform: "translate(-16%, 2%) rotate(-100deg) scale(0.92)",
            borderRadius: "55% 45% 52% 48% / 45% 55% 42% 58%",
          },
          "66%": {
            transform: "translate(-6%, -14%) rotate(-220deg) scale(1.1)",
            borderRadius: "42% 58% 55% 45% / 52% 48% 58% 42%",
          },
        },
        orbFlow3: {
          "0%, 100%": {
            transform: "translate(2%, -10%) rotate(0deg) scale(0.98)",
            borderRadius: "52% 48% 45% 55% / 48% 52% 55% 45%",
          },
          "50%": {
            transform: "translate(-10%, 8%) rotate(180deg) scale(1.08)",
            borderRadius: "45% 55% 52% 48% / 55% 45% 48% 52%",
          },
        },
        orbHalo: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.08)" },
        },
      },
      animation: {
        "orb-speak": "orbSpeakPulse 0.65s ease-in-out infinite",
        "orb-core-breathe": "orbCoreBreathe 3.2s ease-in-out infinite",
        "orb-core-talk": "orbCoreTalk 0.55s ease-in-out infinite",
        "orb-flow-1": "orbFlow1 11s ease-in-out infinite",
        "orb-flow-2": "orbFlow2 14s ease-in-out infinite",
        "orb-flow-3": "orbFlow3 9s ease-in-out infinite",
        "orb-flow-1-fast": "orbFlow1 5.5s ease-in-out infinite",
        "orb-flow-2-fast": "orbFlow2 7s ease-in-out infinite",
        "orb-flow-3-fast": "orbFlow3 4.5s ease-in-out infinite",
        "orb-halo": "orbHalo 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
