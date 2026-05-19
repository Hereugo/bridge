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
        orbRippleOut: {
          "0%": { transform: "scale(0.88)", opacity: "0.5" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        orbCoreGlow: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.04)", opacity: "1" },
        },
        orbSpeakPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.09)" },
        },
        orbWaveDistort: {
          "0%, 100%": { borderRadius: "50%" },
          "33%": { borderRadius: "48% 52% 50% 50% / 50% 50% 52% 48%" },
          "66%": { borderRadius: "52% 48% 48% 52% / 48% 52% 50% 50%" },
        },
        orbGlassShine: {
          "0%": { transform: "rotate(0deg) translateX(2%)" },
          "100%": { transform: "rotate(360deg) translateX(2%)" },
        },
        orbDrift: {
          "0%, 100%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.06)" },
        },
      },
      animation: {
        "orb-ripple": "orbRippleOut 2.4s ease-out infinite",
        "orb-ripple-slow": "orbRippleOut 3.2s ease-out infinite",
        "orb-ripple-fast": "orbRippleOut 1.35s ease-out infinite",
        "orb-core": "orbCoreGlow 2.5s ease-in-out infinite",
        "orb-speak": "orbSpeakPulse 0.75s ease-in-out infinite",
        "orb-wobble": "orbWaveDistort 6s ease-in-out infinite",
        "orb-wobble-slow": "orbWaveDistort 9s ease-in-out infinite",
        "orb-wobble-fast": "orbWaveDistort 3.5s ease-in-out infinite",
        "orb-glass-shine": "orbGlassShine 14s linear infinite",
        "orb-drift": "orbDrift 22s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
