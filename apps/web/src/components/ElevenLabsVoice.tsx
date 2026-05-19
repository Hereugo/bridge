"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { isLikelyElevenLabsAgentId } from "@/lib/api-proxy";
import { apiFetch } from "@/lib/api";
import { VoiceOrb, type VoiceOrbMode } from "@/components/VoiceOrb";

type ConvaiElement = HTMLElement;

interface Props {
  agentId: string;
  apiToken?: string;
  onConversationStart?: (conversationId: string) => void;
}

const WIDGET_ID = "bridge-convai-widget";
const WIDGET_SCRIPT_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";
const START_LABELS = ["start conversation", "start call", "start"];
const END_LABELS = ["end conversation", "end call", "end"];
const CONNECT_TIMEOUT_MS = 25_000;

const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

async function openMicrophone(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS });
}

function getWidget(): ConvaiElement | null {
  return document.getElementById(WIDGET_ID) as ConvaiElement | null;
}

function waitForShadowRoot(el: HTMLElement, timeoutMs = 8000): Promise<ShadowRoot | null> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      if (el.shadowRoot) {
        resolve(el.shadowRoot);
        return;
      }
      if (Date.now() >= deadline) {
        resolve(null);
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function buttonsIn(root: ParentNode): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll("button"));
}

function matchesLabel(btn: HTMLButtonElement, labels: string[]): boolean {
  const hay = `${btn.title} ${btn.textContent ?? ""} ${btn.getAttribute("aria-label") ?? ""}`.toLowerCase();
  return labels.some((l) => hay.includes(l));
}

function findStartButton(root: ShadowRoot): HTMLButtonElement | null {
  return buttonsIn(root).find((b) => matchesLabel(b, START_LABELS) && !b.disabled) ?? null;
}

function findEndButton(root: ShadowRoot): HTMLButtonElement | null {
  return buttonsIn(root).find((b) => matchesLabel(b, END_LABELS)) ?? null;
}

function findAgreeButton(root: ShadowRoot): HTMLButtonElement | null {
  return buttonsIn(root).find((b) => /agree/i.test(b.textContent ?? "")) ?? null;
}

function readWidgetError(root: ShadowRoot): string | null {
  const err = root.querySelector("[class*='_error_']");
  if (err?.textContent?.trim()) return err.textContent.trim();
  return null;
}

function isAgentSpeaking(root: ShadowRoot): boolean {
  const text = root.textContent?.toLowerCase() ?? "";
  return text.includes("speaking") || text.includes("assistant speaking");
}

async function clickWidgetStart(el: ConvaiElement): Promise<void> {
  const root = await waitForShadowRoot(el);
  if (!root) throw new Error("Voice widget did not load. Refresh and try again.");

  const agree = findAgreeButton(root);
  if (agree) {
    agree.click();
    await new Promise((r) => setTimeout(r, 150));
  }

  const start = findStartButton(root);
  if (!start) {
    const err = readWidgetError(root);
    throw new Error(err ?? "Could not find the voice start control. Check your agent ID.");
  }

  start.click();
}

function clickWidgetEnd(el: ConvaiElement): void {
  const root = el.shadowRoot;
  if (!root) return;
  findEndButton(root)?.click();
}

export function ElevenLabsVoice({ agentId, apiToken, onConversationStart }: Props) {
  const [, pulse] = useReducer((x: number) => x + 1, 0);
  const [scriptReady, setScriptReady] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [voiceSessionLoading, setVoiceSessionLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [agentGlowUntil, setAgentGlowUntil] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [micReady, setMicReady] = useState(false);
  const isValidAgentId = isLikelyElevenLabsAgentId(agentId);
  const isPlaceholder = !isValidAgentId;
  const widgetKey = signedUrl ?? agentId;
  const startedRef = useRef(false);
  const connectingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const bumpAgentGlow = useCallback((ms: number) => {
    setAgentGlowUntil((t) => Math.max(t, Date.now() + ms));
  }, []);

  useEffect(() => {
    connectingRef.current = connecting;
  }, [connecting]);

  useEffect(() => {
    const id = window.setInterval(() => pulse(), 200);
    return () => window.clearInterval(id);
  }, [pulse]);

  useEffect(() => {
    if (!apiToken || !isValidAgentId) {
      setSignedUrl(null);
      return;
    }
    let cancelled = false;
    setVoiceSessionLoading(true);
    setError(null);
    apiFetch<{ signed_url: string }>("/journey/voice-signed-url", { token: apiToken })
      .then((res) => {
        if (!cancelled) setSignedUrl(res.signed_url);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setSignedUrl(null);
          setError(
            e instanceof Error
              ? e.message
              : "Could not start a voice session. Check ELEVENLABS_API_KEY on the API."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setVoiceSessionLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiToken, agentId, isValidAgentId]);

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
    script.type = "text/javascript";
    script.onload = () => setScriptReady(true);
    script.onerror = () => {
      setScriptReady(false);
      setError("Could not load the voice module. Check your connection.");
    };
    document.body.appendChild(script);
  }, [agentId]);

  useEffect(() => {
    if (!scriptReady || !agentId || (apiToken && !signedUrl)) return;

    let observer: MutationObserver | null = null;
    let cancelled = false;
    let raf = 0;
    let attempts = 0;

    const attach = () => {
      if (cancelled) return;
      const el = getWidget();
      const root = el?.shadowRoot;
      if (!el || !root) {
        if (++attempts < 120) raf = requestAnimationFrame(attach);
        return;
      }

      const sync = () => {
        if (cancelled) return;
        const widgetErr = readWidgetError(root);
        if (widgetErr) setError(widgetErr);

        const endBtn = findEndButton(root);
        const startBtn = findStartButton(root);
        const inCall = Boolean(endBtn && !startBtn);

        if (inCall) {
          setConnecting(false);
          setSessionActive(true);
          if (!startedRef.current) {
            startedRef.current = true;
            onConversationStart?.(`conv_${Date.now()}`);
            bumpAgentGlow(2800);
          }
          if (isAgentSpeaking(root)) bumpAgentGlow(2200);
        } else if (!connectingRef.current) {
          if (startedRef.current) {
            startedRef.current = false;
            setSessionActive(false);
            setUserSpeaking(false);
            setAgentGlowUntil(0);
          }
        }
      };

      sync();
      observer = new MutationObserver(sync);
      observer.observe(root, { childList: true, subtree: true, characterData: true });
    };

    raf = requestAnimationFrame(attach);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [scriptReady, agentId, apiToken, signedUrl, onConversationStart, bumpAgentGlow]);

  const ensureMicrophone = useCallback(async (): Promise<boolean> => {
    const live =
      streamRef.current?.getAudioTracks().some((t) => t.readyState === "live") ?? false;
    if (live) {
      setMicReady(true);
      return true;
    }

    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await openMicrophone();
      streamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          setMicReady(false);
          void ensureMicrophone();
        };
      });
      setMicReady(true);
      setError((prev) =>
        prev?.includes("Microphone") || prev?.includes("microphone") ? null : prev
      );
      return true;
    } catch {
      setMicReady(false);
      setError("Microphone access is required. Allow the mic in your browser settings and try again.");
      return false;
    }
  }, []);

  useEffect(() => {
    if (!agentId || isPlaceholder) return;
    void ensureMicrophone();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      void audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, [agentId, isPlaceholder, ensureMicrophone]);

  useEffect(() => {
    if (!sessionActive || !micReady) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setUserSpeaking(false);
      return;
    }

    const stream = streamRef.current;
    if (!stream) return;

    let cancelled = false;
    const voicedRef = { current: false };
    let consecutiveLow = 0;

    const ctx = audioCtxRef.current ?? new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") void ctx.resume();

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

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      source.disconnect();
    };
  }, [sessionActive, micReady, bumpAgentGlow]);

  const orbMode: VoiceOrbMode = (() => {
    if (connecting) return "connecting";
    if (!sessionActive) return "idle";
    if (Date.now() < agentGlowUntil) return "speaking";
    if (userSpeaking) return "listening";
    return "ambient";
  })();

  const statusLabel = (() => {
    if (error) return error;
    if (voiceSessionLoading) return "Preparing secure voice session…";
    if (!scriptReady) return "Loading voice…";
    if (apiToken && !signedUrl) return "Voice session unavailable";
    if (!micReady) return "Allow microphone access to continue…";
    if (connecting) return "Connecting…";
    if (!sessionActive) return "Microphone on — tap Start when you’re ready";
    if (Date.now() < agentGlowUntil) return "Companion is speaking…";
    if (userSpeaking) return "Listening to you…";
    return "Companion is here — say hi, or type below";
  })();

  async function handleStart() {
    if (!scriptReady || voiceSessionLoading) return;
    if (apiToken && !signedUrl) {
      setError("Voice session not ready. Check API logs and ELEVENLABS_API_KEY.");
      return;
    }
    const micOk = await ensureMicrophone();
    if (!micOk) return;

    setError(null);
    setConnecting(true);

    try {
      for (let i = 0; i < 60; i++) {
        const el = getWidget();
        if (el?.shadowRoot && findStartButton(el.shadowRoot)) {
          await clickWidgetStart(el);
          window.setTimeout(() => {
            if (connectingRef.current && !startedRef.current) {
              setConnecting(false);
              setError(
                "Could not connect. Check your agent ID, allow the microphone, and try again."
              );
            }
          }, CONNECT_TIMEOUT_MS);
          return;
        }
        await new Promise((r) => setTimeout(r, 100));
      }
      throw new Error("Voice widget is still loading. Wait a moment and try again.");
    } catch (e) {
      setConnecting(false);
      setError(e instanceof Error ? e.message : "Could not start the conversation.");
    }
  }

  function handleEnd() {
    const el = getWidget();
    if (el) clickWidgetEnd(el);
    startedRef.current = false;
    setSessionActive(false);
    setConnecting(false);
    setUserSpeaking(false);
    setAgentGlowUntil(0);
    setError(null);
  }

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
          Voice stays inside Bridge — not a separate phone call. Your microphone stays on while
          you&apos;re here so you can talk naturally.
        </p>

        <div className="mt-6 flex flex-col items-center">
          <VoiceOrb mode={orbMode} />
          <p
            className={`mt-4 min-h-[3rem] max-w-xs text-center text-sm font-medium leading-snug ${
              error ? "text-red-300/90" : "text-bridge-cream/95"
            }`}
          >
            {statusLabel}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {!sessionActive ? (
            <button
              type="button"
              className="btn-primary min-h-[48px] flex-1 px-8 py-3.5 text-base sm:max-w-xs sm:flex-none"
              disabled={
                !scriptReady ||
                !micReady ||
                connecting ||
                isPlaceholder ||
                voiceSessionLoading ||
                Boolean(apiToken && !signedUrl)
              }
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
          <p className="mt-4 text-center text-xs leading-relaxed text-bridge-amber">
            Invalid agent ID in database: <code className="text-bridge-cream/90">{agentId}</code>.
            Copy each Agent ID from ElevenLabs → Conversational AI → Agents (long string like{" "}
            <code className="text-bridge-cream/90">agent_7101k5zvyjhmfg983brhmhkd98n6</code>
            ), update <code className="text-bridge-cream/90">personas.elevenlabs_agent_id</code>, then
            allowlist <code className="text-bridge-cream/90">bridge.dev.libr.live</code> and disable
            agent authentication in the ElevenLabs dashboard.
          </p>
        )}
      </div>

      <elevenlabs-convai
        key={widgetKey}
        id={WIDGET_ID}
        className="bridge-voice-widget-host"
        {...(signedUrl ? { "signed-url": signedUrl } : { "agent-id": agentId })}
        variant="compact"
        action-text="Talk in Bridge"
        start-call-text="Start conversation"
        end-call-text="End conversation"
        listening-text="Listening"
        speaking-text="Speaking"
        avatar-orb-color-1="#e8a87c"
        avatar-orb-color-2="#c76d3e"
      />
    </section>
  );
}

