export type VoiceOrbMode = "idle" | "connecting" | "ambient" | "listening" | "speaking";

interface VoiceOrbProps {
  mode: VoiceOrbMode;
}

const flowClass = {
  fast: ["animate-orb-flow-1-fast", "animate-orb-flow-2-fast", "animate-orb-flow-3-fast"],
  normal: ["animate-orb-flow-1", "animate-orb-flow-2", "animate-orb-flow-3"],
  slow: [
    "animate-orb-flow-1 [animation-duration:16s]",
    "animate-orb-flow-2 [animation-duration:20s]",
    "animate-orb-flow-3 [animation-duration:13s]",
  ],
} as const;

/**
 * Siri-style glass orb: dark shell, flowing orange inner waves, pulsing core when speaking.
 */
export function VoiceOrb({ mode }: VoiceOrbProps) {
  const isSpeaking = mode === "speaking";
  const isListening = mode === "listening";
  const isConnecting = mode === "connecting";
  const isAmbient = mode === "ambient";
  const isLive = isAmbient || isListening || isSpeaking || isConnecting;

  const speed = isSpeaking ? "fast" : isLive ? "normal" : "slow";
  const [flow1, flow2, flow3] = flowClass[speed];
  const waveOpacity = isSpeaking ? 1 : isListening ? 0.88 : isLive ? 0.72 : 0.45;

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
      {/* Outer glow */}
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

      {/* Glass sphere */}
      <div
        className={`relative h-[7.5rem] w-[7.5rem] overflow-hidden rounded-full md:h-[8.5rem] md:w-[8.5rem] ${
          isSpeaking ? "animate-orb-speak" : ""
        } shadow-[0_8px_40px_rgba(255,120,40,0.25),inset_0_1px_0_rgba(255,255,255,0.12)]`}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#1a1520] via-bridge-night to-[#080a0e]" />

        {/* Flowing orange waves */}
        <div
          className="absolute inset-0 overflow-hidden rounded-full transition-opacity duration-500"
          style={{ opacity: waveOpacity }}
          aria-hidden
        >
          <div className="absolute inset-0 scale-110 blur-[18px] mix-blend-screen">
            <div className="absolute left-1/2 top-1/2 h-[78%] w-[82%] -translate-x-1/2 -translate-y-1/2">
              <span
                className={`absolute inset-0 bg-gradient-to-br from-[#ff8c42] via-[#ff6b35] to-transparent opacity-90 ${flow1}`}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 h-[72%] w-[76%] -translate-x-1/2 -translate-y-1/2">
              <span
                className={`absolute inset-0 bg-gradient-to-tr from-[#ffb347] via-bridge-amber to-transparent opacity-85 ${flow2} [animation-delay:-1.5s]`}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 h-[68%] w-[70%] -translate-x-1/2 -translate-y-1/2">
              <span
                className={`absolute inset-0 bg-gradient-to-bl from-[#ff9f6b] via-[#e85d04] to-transparent opacity-80 ${flow3} [animation-delay:-0.8s]`}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-full backdrop-blur-[10px]" />
        </div>

        {/* Bright center core */}
        <div
          className={`absolute left-1/2 top-1/2 z-[1] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,1)_0%,rgba(255,244,230,0.9)_40%,transparent_72%)] ${
            isSpeaking
              ? "animate-orb-core-talk h-10 w-10 blur-[10px] md:h-11 md:w-11"
              : isLive
                ? "animate-orb-core-breathe h-7 w-7 blur-[8px] md:h-8 md:w-8"
                : "h-6 w-6 -translate-x-1/2 -translate-y-1/2 blur-[6px] opacity-60"
          }`}
          aria-hidden
        />
        <div
          className={`absolute left-1/2 top-1/2 z-[2] rounded-full bg-white/90 blur-[2px] ${
            isSpeaking
              ? "animate-orb-core-talk h-3 w-3"
              : isLive
                ? "animate-orb-core-breathe h-2 w-2"
                : "h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 opacity-70"
          }`}
          aria-hidden
        />

        {/* Glass shell */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.14] via-transparent to-black/50" />
        <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
        <div className="pointer-events-none absolute left-[14%] top-[10%] h-[28%] w-[38%] rounded-full bg-gradient-to-br from-white/35 to-transparent blur-md" />
        <div className="pointer-events-none absolute inset-[2px] rounded-full bg-gradient-to-t from-black/35 via-transparent to-transparent" />
      </div>
    </div>
  );
}
