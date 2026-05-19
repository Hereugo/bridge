"use client";

import { Conversation } from "@elevenlabs/client";
import type { Mode, Status } from "@elevenlabs/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { isLikelyElevenLabsAgentId } from "@/lib/api-proxy";
import { apiFetch } from "@/lib/api";
import { VoiceOrb, type VoiceOrbMode } from "@/components/VoiceOrb";

interface Props {
  agentId: string;
  apiToken?: string;
  onConversationStart?: (conversationId: string) => void;
}

const MIC_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

function releaseStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}

export function ElevenLabsVoice({ agentId, apiToken, onConversationStart }: Props) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [voiceSessionLoading, setVoiceSessionLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [agentMode, setAgentMode] = useState<Mode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [micReady, setMicReady] = useState(false);

  const isValidAgentId = isLikelyElevenLabsAgentId(agentId);
  const isPlaceholder = !isValidAgentId;

  const conversationRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(
    null
  );
  const permissionStreamRef = useRef<MediaStream | null>(null);

  const voiceReady = !voiceSessionLoading && Boolean(signedUrl || (!apiToken && isValidAgentId));

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

  const ensureMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      releaseStream(permissionStreamRef.current);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS });
      permissionStreamRef.current = stream;
      releaseStream(stream);
      permissionStreamRef.current = null;
      setMicReady(true);
      setError((prev) => (prev?.toLowerCase().includes("microphone") ? null : prev));
      return true;
    } catch {
      setMicReady(false);
      setError(
        "Microphone access is required. Allow the mic in your browser settings and try again."
      );
      return false;
    }
  }, []);

  useEffect(() => {
    if (!agentId || isPlaceholder) return;
    void ensureMicrophonePermission();
  }, [agentId, isPlaceholder, ensureMicrophonePermission]);

  const endConversation = useCallback(async () => {
    const conv = conversationRef.current;
    conversationRef.current = null;
    if (conv) {
      try {
        await conv.endSession();
      } catch {
        /* already ended */
      }
    }
    setSessionActive(false);
    setConnecting(false);
    setAgentMode(null);
  }, []);

  useEffect(() => {
    return () => {
      void endConversation();
      releaseStream(permissionStreamRef.current);
      permissionStreamRef.current = null;
    };
  }, [endConversation]);

  async function handleStart() {
    if (!voiceReady || connecting || sessionActive) return;
    if (apiToken && !signedUrl) {
      setError("Voice session not ready. Check API logs and ELEVENLABS_API_KEY.");
      return;
    }

    const micOk = await ensureMicrophonePermission();
    if (!micOk) return;

    releaseStream(permissionStreamRef.current);
    permissionStreamRef.current = null;

    setError(null);
    setConnecting(true);

    try {
      await endConversation();

      const sessionOptions = signedUrl
        ? { signedUrl }
        : { agentId, connectionType: "websocket" as const };

      const conversation = await Conversation.startSession({
        ...sessionOptions,
        onConnect: ({ conversationId }) => {
          setConnecting(false);
          setSessionActive(true);
          onConversationStart?.(conversationId);
        },
        onDisconnect: () => {
          setSessionActive(false);
          setConnecting(false);
          setAgentMode(null);
          conversationRef.current = null;
        },
        onError: (message) => {
          setConnecting(false);
          setSessionActive(false);
          setError(
            typeof message === "string" && message
              ? message
              : "Voice connection error. Try again."
          );
        },
        onModeChange: ({ mode }) => setAgentMode(mode),
        onStatusChange: ({ status }: { status: Status }) => {
          if (status === "connecting") setConnecting(true);
          if (status === "connected") setConnecting(false);
          if (status === "disconnected" || status === "disconnecting") {
            setConnecting(false);
            setSessionActive(false);
          }
        },
      });

      conversationRef.current = conversation;
    } catch (e) {
      setConnecting(false);
      setSessionActive(false);
      const msg = e instanceof Error ? e.message : "Could not start the conversation.";
      setError(
        msg.includes("NotAllowedError") || msg.toLowerCase().includes("permission")
          ? "Microphone blocked. Allow mic access for this site and try again."
          : msg
      );
    }
  }

  async function handleEnd() {
    setError(null);
    await endConversation();
  }

  const orbMode: VoiceOrbMode = (() => {
    if (connecting) return "connecting";
    if (!sessionActive) return "idle";
    if (agentMode === "speaking") return "speaking";
    if (agentMode === "listening") return "listening";
    return "ambient";
  })();

  const statusLabel = (() => {
    if (error) return error;
    if (voiceSessionLoading) return "Preparing secure voice session…";
    if (apiToken && !signedUrl) return "Voice session unavailable";
    if (!micReady) return "Allow microphone access to continue…";
    if (connecting) return "Connecting…";
    if (!sessionActive) return "Microphone ready — tap Start when you’re ready";
    if (agentMode === "speaking") return "Companion is speaking…";
    if (agentMode === "listening") return "Listening to you…";
    return "Companion is here — say hi, or type below";
  })();

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
          Voice stays inside Bridge. Allow the mic when prompted, then tap Start to talk with your
          companion.
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
                !voiceReady || !micReady || connecting || isPlaceholder || Boolean(apiToken && !signedUrl)
              }
              onClick={handleStart}
            >
              {!voiceReady ? "Preparing…" : connecting ? "Connecting…" : "Start conversation"}
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
            Copy each Agent ID from ElevenLabs → Conversational AI → Agents.
          </p>
        )}
      </div>
    </section>
  );
}
