"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  TrackToggle,
  useConnectionState,
  useLocalParticipant,
  useParticipants,
} from "@livekit/components-react";
import { ConnectionState, Participant, Track } from "livekit-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { VoiceOrb, type VoiceOrbMode } from "@/components/VoiceOrb";
import { apiFetch } from "@/lib/api";

function normalizeLiveKitUrl(url: string): string {
  if (typeof window === "undefined") return url;
  if (window.location.protocol === "https:" && url.startsWith("ws:")) {
    return url.replace(/^ws:/, "wss:");
  }
  return url;
}

function isWingmanParticipant(participant: Participant): boolean {
  if (participant.isAgent) return true;
  const low = participant.identity.toLowerCase();
  return (
    low.startsWith("agent") ||
    low.includes("wingman") ||
    low.startsWith("bridge-wingman")
  );
}

interface CallToken {
  token: string;
  room_name: string;
  livekit_url: string;
  partner_display_name?: string | null;
}

interface Props {
  matchId: string;
  token: string;
  livekitUrl: string;
  partnerName?: string | null;
  connectionCard?: string | null;
  onLeave: () => void;
}

function useOrbMode(): VoiceOrbMode {
  const connection = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  const remoteHumans = participants.filter((p) => !p.isLocal && !isWingmanParticipant(p));
  const wingman = participants.find((p) => isWingmanParticipant(p));
  const partnerSpeaking = remoteHumans.some((p) => p.isSpeaking);
  const wingmanSpeaking = wingman?.isSpeaking ?? false;
  const localSpeaking = localParticipant.isSpeaking;

  if (connection === ConnectionState.Connecting || connection === ConnectionState.Reconnecting) {
    return "connecting";
  }
  if (connection !== ConnectionState.Connected) {
    return "idle";
  }
  if (wingmanSpeaking) return "speaking";
  if (localSpeaking) return "listening";
  if (partnerSpeaking) return "ambient";
  return "ambient";
}

function ParticipantRow({
  label,
  status,
  muted = false,
}: {
  label: string;
  status: string;
  muted?: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className={muted ? "text-bridge-muted" : "text-bridge-cream"}>{label}</span>
      <span className="text-bridge-muted">{status}</span>
    </li>
  );
}

function InCallUI({
  partnerName,
  onLeave,
  leaving,
}: {
  partnerName: string;
  onLeave: () => void;
  leaving: boolean;
}) {
  const connection = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const orbMode = useOrbMode();

  const remoteHumans = participants.filter((p) => !p.isLocal && !isWingmanParticipant(p));
  const wingmanHere = participants.some((p) => isWingmanParticipant(p));
  const partnerHere = remoteHumans.length > 0;
  const companionStatus = wingmanHere
    ? "Listening quietly"
    : connection === ConnectionState.Connected
      ? "Joining…"
      : "Waiting for room…";

  const statusLabel = useMemo(() => {
    if (connection === ConnectionState.Reconnecting) return "Reconnecting…";
    if (connection !== ConnectionState.Connected) return "Connecting to the room…";
    if (!partnerHere) return `Waiting for ${partnerName} to join…`;
    if (orbMode === "listening") return "You're speaking…";
    if (orbMode === "speaking") return "Companion is offering a prompt…";
    if (remoteHumans.some((p) => p.isSpeaking)) return `${partnerName} is speaking…`;
    return "You're in — take your time and say hi";
  }, [connection, partnerHere, partnerName, orbMode, remoteHumans]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-bridge-charcoal/95 to-bridge-night/90 shadow-2xl">
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-bridge-amber/12 blur-3xl"
        aria-hidden
      />

      <div className="relative px-5 pb-6 pt-8 md:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-bridge-amber/90">
          Live in Bridge
        </p>

        <div className="mt-6 flex flex-col items-center">
          <VoiceOrb mode={orbMode} />
          <p className="mt-4 min-h-[3rem] max-w-xs text-center text-sm font-medium leading-snug text-bridge-cream/95">
            {statusLabel}
          </p>
        </div>

        <ul className="mt-6 space-y-2 rounded-2xl border border-white/[0.06] bg-bridge-night/50 px-4 py-3 text-sm">
          <ParticipantRow label="You" status={localParticipant.isSpeaking ? "Speaking" : "Here"} />
          <ParticipantRow
            label={partnerName}
            status={partnerHere ? (remoteHumans[0]?.isSpeaking ? "Speaking" : "Here") : "Not yet"}
            muted={!partnerHere}
          />
          <ParticipantRow label="Companion" status={companionStatus} muted={!wingmanHere} />
        </ul>

        <div className="bridge-call-controls mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <TrackToggle
            source={Track.Source.Microphone}
            className="btn-ghost min-h-[48px] flex-1 justify-center gap-2 sm:max-w-[160px]"
            showIcon
          >
            Microphone
          </TrackToggle>
          <button
            type="button"
            className="btn-ghost min-h-[48px] flex-1 border-red-400/30 text-red-300/90 hover:border-red-400/50 sm:max-w-[200px]"
            disabled={leaving}
            onClick={onLeave}
          >
            {leaving ? "Leaving…" : "End call"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-bridge-muted">
          Your companion only speaks if the chat goes quiet for a while.
        </p>
      </div>

      <RoomAudioRenderer />
    </section>
  );
}

function PreJoinUI({
  partnerName,
  connectionCard,
  onJoin,
  joining,
}: {
  partnerName: string;
  connectionCard?: string | null;
  onJoin: () => void;
  joining: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-bridge-charcoal/95 to-bridge-night/90 shadow-2xl">
      <div className="relative px-5 pb-8 pt-8 md:px-8 md:pt-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-bridge-amber/90">
          Introduction call
        </p>
        <h2 className="mt-2 text-center font-display text-2xl text-bridge-cream md:text-3xl">
          Ready to meet {partnerName}?
        </h2>
        {connectionCard && (
          <p className="mx-auto mt-3 max-w-md text-center text-sm italic leading-relaxed text-bridge-muted">
            {connectionCard}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center">
          <VoiceOrb mode="idle" />
          <p className="mt-4 max-w-xs text-center text-sm text-bridge-muted">
            You&apos;ll need your microphone. The room is private to you, {partnerName}, and a quiet
            companion who only chimes in if things stall.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary mx-auto mt-8 flex min-h-[48px] w-full max-w-sm items-center justify-center px-8 text-base"
          disabled={joining}
          onClick={onJoin}
        >
          {joining ? "Joining…" : "Join call"}
        </button>
      </div>
    </section>
  );
}

export function WingmanCall({
  token,
  livekitUrl,
  partnerName,
  connectionCard,
  onLeave,
}: Props) {
  const [joined, setJoined] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const displayPartner = partnerName?.trim() || "your match";
  const serverUrl = normalizeLiveKitUrl(livekitUrl);

  const handleLeave = useCallback(async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await onLeave();
    } finally {
      setLeaving(false);
    }
  }, [leaving, onLeave]);

  if (!joined) {
    return (
      <PreJoinUI
        partnerName={displayPartner}
        connectionCard={connectionCard}
        onJoin={() => setJoined(true)}
        joining={false}
      />
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      audio
      video={false}
      onDisconnected={handleLeave}
      options={{
        adaptiveStream: true,
        dynacast: true,
      }}
    >
      <InCallUI partnerName={displayPartner} onLeave={handleLeave} leaving={leaving} />
    </LiveKitRoom>
  );
}

export function useCallToken(matchId: string | null, apiToken: string | undefined) {
  const [data, setData] = useState<CallToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!matchId || !apiToken) return;
    setLoading(true);
    setError(null);
    apiFetch<CallToken>(`/calls/${matchId}/token`, { method: "POST", token: apiToken })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [matchId, apiToken]);

  return { data, error, loading };
}
