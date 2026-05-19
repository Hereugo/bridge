export type VoiceOrbMode = "idle" | "connecting" | "ambient" | "listening" | "speaking";

interface VoiceOrbProps {
  mode: VoiceOrbMode;
}

/**
 * Glassy core with overlapping wave layers when live; ripples + slow rotation.
 */
export function VoiceOrb({ mode }: VoiceOrbProps) {
  const isSpeaking = mode === "speaking";
  const isListening = mode === "listening";
  const isAmbient = mode === "ambient";
  const isConnecting = mode === "connecting";
  const isLive = isAmbient || isListening || isSpeaking;

  const rippleClass = isSpeaking
    ? "animate-orb-ripple-fast border-white/20"
    : isListening
      ? "animate-orb-ripple border-white/15"
      : isAmbient || isConnecting
        ? "animate-orb-ripple-slow border-white/10"
        : "opacity-0";

  return (
    <div
      className={`relative mx-auto flex h-44 w-44 items-center justify-center transition-transform duration-500 ease-out md:h-52 md:w-52 ${
        isSpeaking ? "scale-[1.02]" : "scale-100"
      }`}
    >
      {/* Glass-tinted ripples */}
      <span
        className={`absolute inset-0 rounded-full border bg-bridge-amber/[0.04] backdrop-blur-[2px] ${rippleClass}`}
        aria-hidden
      />
      <span
        className={`absolute inset-2 rounded-full border bg-bridge-amber/[0.03] backdrop-blur-[2px] ${
          isSpeaking
            ? "animate-orb-ripple-fast border-white/15 [animation-delay:180ms]"
            : isLive
              ? "animate-orb-ripple-slow border-white/10 [animation-delay:400ms]"
              : "opacity-0"
        }`}
        aria-hidden
      />
      <span
        className={`absolute inset-5 rounded-full border bg-bridge-amber/[0.02] backdrop-blur-[2px] ${
          isSpeaking
            ? "animate-orb-ripple border-white/10 [animation-delay:320ms]"
            : isLive
              ? "animate-orb-ripple border-white/[0.07] [animation-delay:800ms]"
              : "opacity-0"
        }`}
        aria-hidden
      />

      {/* Slow ambient halo */}
      <div
        className={`pointer-events-none absolute inset-6 rounded-full bg-gradient-to-br from-bridge-amber/25 via-bridge-amber/5 to-transparent blur-xl transition-opacity duration-700 ${
          isLive ? "animate-orb-drift opacity-100" : "opacity-30"
        }`}
        aria-hidden
      />

      {/* Core glass orb */}
      <div
        className={`relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/25 md:h-32 md:w-32 ${
          isSpeaking
            ? "animate-orb-speak shadow-[0_0_48px_rgba(232,168,124,0.5),inset_0_1px_0_rgba(255,255,255,0.45)]"
            : isListening
              ? "animate-orb-core shadow-[0_0_32px_rgba(232,168,124,0.35),inset_0_1px_0_rgba(255,255,255,0.35)]"
              : isLive
                ? "shadow-[0_0_24px_rgba(232,168,124,0.22),inset_0_1px_0_rgba(255,255,255,0.3)]"
                : "shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_24px_rgba(0,0,0,0.25)]"
        }`}
      >
        {/* Frosted base */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-white/25 via-bridge-amber/35 to-amber-800/50 backdrop-blur-md transition-opacity duration-500 ${
            isSpeaking ? "opacity-95" : isListening ? "opacity-88" : "opacity-75"
          }`}
        />

        {/* Overlapping wave blobs (speaking / listening) */}
        {(isSpeaking || isListening) && (
          <>
            <span
              className={`absolute -inset-[12%] bg-gradient-to-tr from-bridge-amber/55 via-bridge-cream/20 to-transparent blur-[6px] ${
                isSpeaking ? "animate-orb-wobble-fast opacity-70" : "animate-orb-wobble opacity-50"
              }`}
              aria-hidden
            />
            <span
              className={`absolute -inset-[8%] bg-gradient-to-bl from-bridge-cream/30 via-bridge-amber/40 to-transparent blur-[4px] ${
                isSpeaking
                  ? "animate-orb-wobble opacity-60 [animation-delay:-1.2s]"
                  : "animate-orb-wobble-slow opacity-40 [animation-delay:-2s]"
              }`}
              aria-hidden
            />
            {isSpeaking && (
              <span
                className="absolute -inset-[6%] animate-orb-wobble-slow bg-gradient-to-tl from-white/25 via-bridge-amber/35 to-transparent opacity-55 blur-[3px] [animation-delay:-3.5s]"
                aria-hidden
              />
            )}
          </>
        )}

        {/* Inner depth + glass tint */}
        <div
          className={`absolute inset-[3px] rounded-full bg-gradient-to-tl from-bridge-night/30 via-transparent to-bridge-cream/25 transition-opacity duration-500 ${
            isLive ? "opacity-100" : "opacity-70"
          }`}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-transparent to-bridge-night/20" />

        {/* Rotating specular sweep */}
        <div
          className={`absolute inset-0 overflow-hidden rounded-full ${isLive ? "animate-orb-glass-shine" : ""}`}
          aria-hidden
        >
          <div
            className={`absolute -left-1/4 -top-1/4 h-[70%] w-[85%] rounded-full bg-gradient-to-br from-white/55 via-white/15 to-transparent blur-[2px] transition-opacity duration-500 ${
              isSpeaking ? "opacity-90" : isLive ? "opacity-65" : "opacity-40"
            }`}
          />
        </div>

        {/* Bottom caustic */}
        <div
          className="absolute inset-x-3 bottom-2 h-1/3 rounded-full bg-gradient-to-t from-bridge-amber/30 to-transparent blur-md"
          aria-hidden
        />

        {/* Inner shimmer */}
        <div
          className={`absolute inset-4 rounded-full bg-bridge-cream/15 blur-sm transition-opacity duration-500 ${
            isSpeaking ? "animate-orb-core opacity-100" : isLive ? "opacity-70" : "opacity-0"
          }`}
        />

        {/* Rim highlight */}
        <div
          className={`pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/30 transition-opacity duration-500 ${
            isSpeaking ? "opacity-95" : "opacity-70"
          }`}
        />

        {/* Rotating dashed rings */}
        <svg
          className="relative z-[1] h-full w-full text-white/20"
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
            className={isLive ? "origin-center animate-[spin_20s_linear_infinite]" : ""}
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 12"
            className={
              isLive
                ? "origin-center animate-[spin_14s_linear_infinite_reverse] text-bridge-cream/15"
                : ""
            }
          />
          {isSpeaking && (
            <circle
              cx="50"
              cy="50"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="2 10"
              className="origin-center animate-[spin_8s_linear_infinite] text-white/25"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
