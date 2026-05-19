"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, Journey } from "@/lib/api";
import { useCallToken, WingmanCall } from "@/components/WingmanCall";

export default function CallPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);
  const { data: callToken, error } = useCallToken(
    journey?.match_id ?? null,
    session?.apiToken
  );

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.apiToken) return;
    apiFetch<Journey>("/journey/me", { token: session.apiToken }).then(setJourney);
  }, [session?.apiToken]);

  async function handleLeave() {
    if (journey?.match_id && session?.apiToken) {
      await apiFetch(`/calls/${journey.match_id}/complete`, {
        method: "POST",
        token: session.apiToken,
      });
    }
    router.push("/complete");
  }

  if (!journey) return <p className="text-bridge-muted">Loading…</p>;

  if (error) {
    return (
      <div className="card-surface">
        <p className="text-bridge-muted">
          LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.
        </p>
        <p className="mt-2 text-sm text-red-400">{error}</p>
        <button type="button" className="btn-primary mt-4 w-full" onClick={handleLeave}>
          Complete demo without call
        </button>
      </div>
    );
  }

  if (!callToken?.token || !callToken.livekit_url) {
    return <p className="text-bridge-muted">Connecting to room…</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-bridge-amber">Wingman</p>
        <h1 className="font-display mt-2 text-3xl">Introduction call</h1>
        {journey.connection_card && (
          <p className="mt-2 text-sm italic text-bridge-muted">{journey.connection_card}</p>
        )}
      </header>

      <WingmanCall
        matchId={journey.match_id!}
        token={callToken.token}
        livekitUrl={callToken.livekit_url}
        onLeave={handleLeave}
      />
    </div>
  );
}
