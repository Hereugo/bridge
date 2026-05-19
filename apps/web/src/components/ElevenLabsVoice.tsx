"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { VoiceOrb, type VoiceOrbMode } from "@/components/VoiceOrb";

type ConvaiElement = HTMLElement & {
  startConversation?: () => void | Promise<void>;
  endConversation?: () => void | Promise<void>;
};

interface Props {
  agentId: string;
  onConversationStart?: (conversationId: string) => void;
}

const WIDGET_ID = "bridge-convai-widget";
const WIDGET_SCRIPT_SRC = "https://elevenlabs.io/convai-widget/index.js";

function getWidget(): ConvaiElement | null {
  return document.getElementById(WIDGET_ID) as ConvaiElement | null;
}

function extractConversationId(detail: unknown): string | undefined {
  if (!detail || typeof detail !== "object") return undefined;
  const d = detail as Record<string, unknown>;
  if (typeof d.conversationId === "string") return d.conversationId;
  if (typeof d.conversation_id === "string") return d.conversation_id;
  return undefined;
}

export function ElevenLabsVoice({ agentId, onConversationStart }: Props) {
  const [, pulse] = useReducer((x: number) => x + 1, 0);
  const [scriptReady, setScriptReady] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [agentGlowUntil, setAgentGlowUntil] = useState(0);
  const rafRef = { current: null as number | null };
  const audioCtxRef = { current: null as AudioContext | null };
  const streamRef = { current: null as MediaStream | null };

  const bumpAgentGlow = useCallback((ms: number) => {
    setAgentGlowUntil((t) => Math.max(t, Date.now() + ms));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => pulse(), 200);
    return () => window.clearInterval(id);
  }, [pulse]);

  useEffect(() => {
    if (!agentId) return;
    const existing = document.getElementById("elevenlabs-convai-script");
    if (existing) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "elevenlabs-convai-script";
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => setScriptReady(false);
    document.body.appendChild(script);
  }, [agentId]);

  useEffect(() => {
    if (!scriptReady || !agentId) return;

    const onStarted = (e: Event) => {
      setSessionActive(true);
      setConnecting(false);
      const ce = e as CustomEvent<unknown>;
      const convId = extractConversationId(ce.detail) ?? `conv_${Date.now()}`;
      onConversationStart?.(convId);
      bumpAgentGlow(2800);
    };

    const onEnded = () => {
      setSessionActive(false);
      setConnecting(false);
      setUserSpeaking(false);
      setAgentGlowUntil(0);
    };

    const onMaybeAgent = () => bumpAgentGlow(3200);

    let cancelled = false;
    let detach: (() => void) | undefined;
    let raf = 0;
    let attempts = 0;
    const maxAttempts = 60;

    const tryAttach = () => {
      if (cancelled) return;
      const node = getWidget();
      if (node) {
        node.addEventListener("conversationStarted", onStarted);
        node.addEventListener("conversationEnded", onEnded);
        const extras = [
          "speakingStarted",
          "agentSpeaking",
          "playbackStarted",
          "audio",
          "agent_response",
          "modeChange",
        ] as const;
        const removers = extras.map((name) => {
          const fn = () => onMaybeAgent();
          node.addEventListener(name, fn);
          return () => node.removeEventListener(name, fn);
        });
        detach = () => {
          node.removeEventListener("conversationStarted", onStarted);
          node.removeEventListener("conversationEnded", onEnded);
          removers.forEach((fn) => fn());
        };
        return;
      }
      if (++attempts < maxAttempts) {
        raf = requestAnimationFrame(tryAttach);
      }
    };

    raf = requestAnimationFrame(tryAttach);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      detach?.();
    };
  }, [scriptReady, agentId, onConversationStart, bumpAgentGlow]);

  useEffect(() => {
    if (!sessionActive) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      void audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
      setUserSpeaking(false);
      return;
    }

    let cancelled = false;
    const voicedRef = { current: false };
    let consecutiveLow = 0;

    async function run() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.82;
        source.connect(analyser);

        const data = new Uint8Array(analyser.fftSize);
        const hiTh = 0.022;
        const loTh = 0.014;

        const tick = () => {
          if (cancelled) return;
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);

          if (rms > hiTh) {
            voicedRef.current = true;
            consecutiveLow = 0;
            setUserSpeaking(true);
          } else if (rms < loTh) {
            consecutiveLow++;
            if (consecutiveLow >= 14 && voicedRef.current) {
              voicedRef.current = false;
              bumpAgentGlow(5000);
              setUserSpeaking(false);
              consecutiveLow = 0;
            }
          } else {
            consecutiveLow = Math.max(0, consecutiveLow - 1);
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        /* mic denied */
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      void audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, [sessionActive, bumpAgentGlow]);

  const orbMode: VoiceOrbMode = (() => {
    if (connecting) return "connecting";
    if (!sessionActive) return "idle";
    if (Date.now() < agentGlowUntil) return "speaking";
    if (userSpeaking) return "listening";
    return "ambient";
  })();

  const statusLabel = (() => {
    if (!scriptReady) return "Loading voice…";
    if (connecting) return "Connecting…";
    if (!sessionActive) return "Ready when you are";
    if (Date.now() < agentGlowUntil) return "Companion is speaking…";
    if (userSpeaking) return "Listening to you…";
    return "Companion is here — say hi, or type below";
  })();

  async function handleStart() {
    setConnecting(true);
    for (let i = 0; i < 30; i++) {
      const el = getWidget();
      if (el?.startConversation) {
        try {
          await Promise.resolve(el.startConversation());
          return;
        } catch {
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 80));
    }
    setConnecting(false);
  }

  function handleEnd() {
    getWidget()?.endConversation?.();
    setSessionActive(false);
    setConnecting(false);
    setUserSpeaking(false);
    setAgentGlowUntil(0);
  }

  const isPlaceholder = agentId.includes("placeholder");

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-bridge-charcoal/95 to-bridge-night/90 shadow-2xl">
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-bridge-amber/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-bridge-amber/8 blur-3xl"
        aria-hidden
      />

      <div className="relative px-5 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-bridge-amber/90">
          In this app
        </p>
        <h2 className="mt-2 text-center font-display text-2xl text-bridge-cream md:text-3xl">
          Conversation
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-bridge-muted">
          Voice stays inside Bridge — not a separate phone call. Start here, allow the mic once,
          then talk naturally.
        </p>

        <div className="mt-6 flex flex-col items-center">
          <VoiceOrb mode={orbMode} />
          <p className="mt-4 min-h-[3rem] max-w-xs text-center text-sm font-medium leading-snug text-bridge-cream/95">
            {statusLabel}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {!sessionActive ? (
            <button
              type="button"
              className="btn-primary min-h-[48px] flex-1 px-8 py-3.5 text-base sm:max-w-xs sm:flex-none"
              disabled={!scriptReady || connecting}
              onClick={handleStart}
            >
              {!scriptReady ? "Preparing…" : connecting ? "Starting…" : "Start conversation"}
            </button>
          ) : (
            <button
              type="button"
              className="btn-ghost min-h-[48px] flex-1 border-red-400/30 text-red-300/90 hover:border-red-400/50 sm:max-w-xs sm:flex-none"
              onClick={handleEnd}
            >
              End conversation
            </button>
          )}
        </div>

        {isPlaceholder && (
          <p className="mt-4 text-center text-xs text-bridge-amber">
            Set real ElevenLabs agent IDs on personas in the database for live voice.
          </p>
        )}
      </div>

      <div className="hidden" aria-hidden>
        <elevenlabs-convai
          id={WIDGET_ID}
          agent-id={agentId}
          variant="compact"
          action-text="Talk in Bridge"
          start-call-text="Start"
          end-call-text="End"
          listening-text="Listening"
          speaking-text="Speaking"
          avatar-orb-color-1="#e8a87c"
          avatar-orb-color-2="#c76d3e"
        />
      </div>
    </section>
  );
}
