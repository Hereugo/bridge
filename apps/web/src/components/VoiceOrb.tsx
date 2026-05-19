export type VoiceOrbMode = "idle" | "connecting" | "ambient" | "listening" | "speaking";

interface VoiceOrbProps {
  mode: VoiceOrbMode;
}

/**
 * Ambient rings + soft core; intensifies for user (listening) and agent (speaking).
 */
export function VoiceOrb({ mode }: VoiceOrbProps) {
  const isSpeaking = mode === "speaking";
  const isListening = mode === "listening";
  const isAmbient = mode === "ambient";
  const isConnecting = mode === "connecting";
  const isLive = isAmbient || isListening || isSpeaking;

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center md:h-52 md:w-52">
      {/* Expanding ripples */}
      <span
        className={`absolute inset-0 rounded-full border border-bridge-amber/25 ${
          isSpeaking
            ? "animate-orb-ripple-fast"
            : isListening
              ? "animate-orb-ripple"
              : isAmbient || isConnecting
                ? "animate-orb-ripple-slow"
                : "opacity-0"
        }`}
        aria-hidden
      />
      <span
        className={`absolute inset-2 rounded-full border border-bridge-amber/20 ${
          isSpeaking ? "animate-orb-ripple-fast [animation-delay:180ms]" : isLive ? "animate-orb-ripple-slow [animation-delay:400ms]" : "opacity-0"
        }`}
        aria-hidden
      />
      <span
        className={`absolute inset-5 rounded-full border border-bridge-amber/15 ${
          isSpeaking ? "animate-orb-ripple [animation-delay:320ms]" : isLive ? "animate-orb-ripple [animation-delay:800ms]" : "opacity-0"
        }`}
        aria-hidden
      />

      {/* Core orb */}
      <div
        className={`relative flex h-28 w-28 items-center justify-center rounded-full md:h-32 md:w-32 ${
          isSpeaking
            ? "animate-orb-speak shadow-[0_0_40px_rgba(232,168,124,0.45)]"
            : isListening
              ? "animate-orb-core shadow-[0_0_28px_rgba(232,168,124,0.28)]"
              : isLive
                ? "shadow-[0_0_20px_rgba(232,168,124,0.18)]"
                : ""
        }`}
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-bridge-amber via-bridge-amber/90 to-amber-700/80 ${
            isSpeaking ? "opacity-100" : isListening ? "opacity-95" : "opacity-80"
          }`}
        />
        <div className="absolute inset-[3px] rounded-full bg-gradient-to-tl from-bridge-night/25 via-transparent to-bridge-cream/20" />
        {/* Inner shimmer */}
        <div
          className={`absolute inset-4 rounded-full bg-bridge-cream/10 blur-sm ${
            isSpeaking ? "animate-orb-core" : isLive ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Subtle wave stroke on rim */}
        <svg
          className="relative z-[1] h-full w-full text-bridge-night/15"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="8 14"
            className={isLive ? "origin-center animate-[spin_18s_linear_infinite]" : ""}
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 12"
            className={isLive ? "origin-center animate-[spin_12s_linear_infinite_reverse]" : ""}
          />
        </svg>
      </div>
    </div>
  );
}
