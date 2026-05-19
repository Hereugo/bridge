import { useId } from "react";

export type VoiceOrbMode = "idle" | "connecting" | "ambient" | "listening" | "speaking";

interface VoiceOrbProps {
  mode: VoiceOrbMode;
}

const flowClass = {
  fast: ["animate-orb-flow-1-fast", "animate-orb-flow-2-fast", "animate-orb-flow-3-fast"],
  normal: ["animate-orb-flow-1", "animate-orb-flow-2", "animate-orb-flow-3"],
  slow: [
    "animate-orb-flow-1 [animation-duration:14s]",
    "animate-orb-flow-2 [animation-duration:18s]",
    "animate-orb-flow-3 [animation-duration:11s]",
  ],
} as const;

/**
 * Siri-style glass orb with SVG fluid waves (goo merge + orbital flow).
 */
export function VoiceOrb({ mode }: VoiceOrbProps) {
  const uid = useId().replace(/:/g, "");
  const filterId = `orb-goo-${uid}`;
  const g1 = `orb-w1-${uid}`;
  const g2 = `orb-w2-${uid}`;
  const g3 = `orb-w3-${uid}`;

  const isSpeaking = mode === "speaking";
  const isListening = mode === "listening";
  const isConnecting = mode === "connecting";
  const isAmbient = mode === "ambient";
  const isLive = isAmbient || isListening || isSpeaking || isConnecting;

  const speed = isSpeaking ? "fast" : isLive ? "normal" : "slow";
  const [flow1, flow2, flow3] = flowClass[speed];
  const waveOpacity = isSpeaking ? 1 : isListening ? 0.92 : isLive ? 0.8 : 0.55;

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
      <div
        className={`pointer-events-none absolute inset-4 rounded-full transition-opacity duration-700 ${
          isSpeaking
            ? "animate-orb-halo bg-orange-400/25 blur-3xl"
            : isLive
              ? "bg-orange-500/15 blur-3xl opacity-80"
              : "bg-orange-600/10 blur-2xl opacity-40"
        }`}
        aria-hidden
      />

      <div
        className={`relative h-[7.5rem] w-[7.5rem] overflow-hidden rounded-full md:h-[8.5rem] md:w-[8.5rem] ${
          isSpeaking ? "animate-orb-speak" : ""
        } shadow-[0_8px_40px_rgba(255,120,40,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]`}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1a1520] via-bridge-night to-[#080a0e]" />

        <div
          className="absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500"
          style={{ opacity: waveOpacity }}
          aria-hidden
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <filter
                id={filterId}
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
                  result="goo"
                />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
              <radialGradient id={g1} cx="35%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#ffd89b" />
                <stop offset="45%" stopColor="#ff8c42" />
                <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={g2} cx="65%" cy="60%" r="65%">
                <stop offset="0%" stopColor="#ffe8cc" />
                <stop offset="50%" stopColor="#ffb347" />
                <stop offset="100%" stopColor="#e85d04" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={g3} cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#ffab76" />
                <stop offset="55%" stopColor="#ff5722" />
                <stop offset="100%" stopColor="#bf360c" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g filter={`url(#${filterId})`}>
              <g className={`orb-wave-motion ${flow1}`}>
                <ellipse
                  className="animate-orb-flow-skew origin-center"
                  cx="50"
                  cy="50"
                  rx="36"
                  ry="20"
                  fill={`url(#${g1})`}
                />
              </g>
              <g className={`orb-wave-motion ${flow2} [animation-delay:-2.5s]`}>
                <ellipse
                  className="animate-orb-flow-skew origin-center [animation-delay:-1.2s]"
                  cx="50"
                  cy="50"
                  rx="32"
                  ry="26"
                  fill={`url(#${g2})`}
                />
              </g>
              <g className={`orb-wave-motion ${flow3} [animation-delay:-4s]`}>
                <ellipse
                  className="animate-orb-flow-skew origin-center [animation-delay:-2.8s]"
                  cx="50"
                  cy="50"
                  rx="30"
                  ry="18"
                  fill={`url(#${g3})`}
                />
              </g>
            </g>
          </svg>
        </div>

        <div
          className={`absolute left-1/2 top-1/2 z-[2] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,1)_0%,rgba(255,244,230,0.85)_35%,transparent_70%)] ${
            isSpeaking
              ? "animate-orb-core-talk h-10 w-10 blur-[8px] md:h-11 md:w-11"
              : isLive
                ? "animate-orb-core-breathe h-7 w-7 blur-[6px] md:h-8 md:w-8"
                : "h-6 w-6 -translate-x-1/2 -translate-y-1/2 blur-[5px] opacity-65"
          }`}
          aria-hidden
        />
        <div
          className={`absolute left-1/2 top-1/2 z-[3] rounded-full bg-white/95 shadow-[0_0_12px_rgba(255,220,180,0.9)] ${
            isSpeaking
              ? "animate-orb-core-talk h-3 w-3"
              : isLive
                ? "animate-orb-core-breathe h-2 w-2"
                : "h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 opacity-75"
          }`}
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 z-[4] rounded-full bg-gradient-to-br from-white/[0.1] via-transparent to-black/35" />
        <div className="pointer-events-none absolute inset-0 z-[4] rounded-full ring-1 ring-inset ring-white/20" />
        <div className="pointer-events-none absolute left-[14%] top-[10%] z-[4] h-[28%] w-[38%] rounded-full bg-gradient-to-br from-white/30 to-transparent blur-md" />
        <div className="pointer-events-none absolute inset-[2px] z-[4] rounded-full bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>
    </div>
  );
}
