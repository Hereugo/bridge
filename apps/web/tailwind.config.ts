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
          "0%": { transform: "rotate(0deg) translateX(20px) rotate(0deg) scale(1)" },
          "25%": { transform: "rotate(90deg) translateX(20px) rotate(-90deg) scale(1.14)" },
          "50%": { transform: "rotate(180deg) translateX(20px) rotate(-180deg) scale(0.9)" },
          "75%": { transform: "rotate(270deg) translateX(20px) rotate(-270deg) scale(1.08)" },
          "100%": { transform: "rotate(360deg) translateX(20px) rotate(-360deg) scale(1)" },
        },
        orbFlow2: {
          "0%": { transform: "rotate(120deg) translateX(17px) rotate(-120deg) scale(1.06)" },
          "25%": { transform: "rotate(210deg) translateX(17px) rotate(-210deg) scale(0.88)" },
          "50%": { transform: "rotate(300deg) translateX(17px) rotate(-300deg) scale(1.12)" },
          "75%": { transform: "rotate(30deg) translateX(17px) rotate(-30deg) scale(0.94)" },
          "100%": { transform: "rotate(120deg) translateX(17px) rotate(-120deg) scale(1.06)" },
        },
        orbFlow3: {
          "0%": { transform: "rotate(240deg) translateX(14px) rotate(-240deg) scale(0.92)" },
          "33%": { transform: "rotate(0deg) translateX(14px) rotate(0deg) scale(1.1)" },
          "66%": { transform: "rotate(120deg) translateX(14px) rotate(-120deg) scale(0.86)" },
          "100%": { transform: "rotate(240deg) translateX(14px) rotate(-240deg) scale(0.92)" },
        },
        orbFlowSkew: {
          "0%, 100%": { transform: "scaleX(1) scaleY(1)" },
          "50%": { transform: "scaleX(1.18) scaleY(0.88)" },
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
        "orb-flow-1": "orbFlow1 8s linear infinite",
        "orb-flow-2": "orbFlow2 10s linear infinite",
        "orb-flow-3": "orbFlow3 6.5s linear infinite",
        "orb-flow-1-fast": "orbFlow1 3.2s linear infinite",
        "orb-flow-2-fast": "orbFlow2 4s linear infinite",
        "orb-flow-3-fast": "orbFlow3 2.8s linear infinite",
        "orb-flow-skew": "orbFlowSkew 5s ease-in-out infinite",
        "orb-halo": "orbHalo 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
