"use client";

import { LiveKitRoom, RoomAudioRenderer, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Props {
  matchId: string;
  token: string;
  livekitUrl: string;
  onLeave: () => void;
}

function CallUI({ onLeave }: { onLeave: () => void }) {
  const tracks = useTracks([Track.Source.Microphone]);
  return (
    <div className="space-y-4">
      <p className="text-bridge-muted text-sm">
        {tracks.length} participant(s) in room. Wingman listens quietly unless the chat stalls.
      </p>
      <RoomAudioRenderer />
      <button type="button" className="btn-ghost w-full" onClick={onLeave}>
        Leave call
      </button>
    </div>
  );
}

export function WingmanCall({ matchId, token, livekitUrl, onLeave }: Props) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      connect
      audio
      video={false}
      onDisconnected={onLeave}
    >
      <CallUI onLeave={onLeave} />
    </LiveKitRoom>
  );
}

export function useCallToken(matchId: string | null, apiToken: string | undefined) {
  const [data, setData] = useState<{
    token: string;
    room_name: string;
    livekit_url: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId || !apiToken) return;
    apiFetch<{ token: string; room_name: string; livekit_url: string }>(
      `/calls/${matchId}/token`,
      { method: "POST", token: apiToken }
    )
      .then(setData)
      .catch((e) => setError(e.message));
  }, [matchId, apiToken]);

  return { data, error };
}
