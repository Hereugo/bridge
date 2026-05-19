"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, Journey } from "@/lib/api";
import { useCallToken, WingmanCall } from "@/components/WingmanCall";

export default function CallPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [completing, setCompleting] = useState(false);
  const { data: callToken, error, loading: tokenLoading } = useCallToken(
    journey?.match_id ?? null,
    session?.apiToken
  );

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.apiToken) return;
    apiFetch<Journey>("/journey/me", { token: session.apiToken })
      .then(setJourney)
      .catch(() => router.replace("/"));
  }, [session?.apiToken, router]);

  const handleLeave = useCallback(async () => {
    if (completing) return;
    setCompleting(true);
    try {
      if (journey?.match_id && session?.apiToken) {
        await apiFetch(`/calls/${journey.match_id}/complete`, {
          method: "POST",
          token: session.apiToken,
        });
      }
      router.push("/complete");
    } finally {
      setCompleting(false);
    }
  }, [completing, journey?.match_id, session?.apiToken, router]);

  async function skipWithoutCall() {
    await handleLeave();
  }

  if (!journey) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-bridge-amber/25" />
        <p className="text-sm text-bridge-muted">Loading your call…</p>
      </div>
    );
  }

  if (!journey.match_id) {
    return (
      <div className="card-surface text-center">
        <p className="text-bridge-cream">No introduction is scheduled yet.</p>
        <button type="button" className="btn-ghost mt-4" onClick={() => router.push("/know")}>
          Back to Know
        </button>
      </div>
    );
  }

  if (error) {
    const isConfig = /not configured/i.test(error);
    return (
      <div className="space-y-6">
        <header className="text-center md:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-bridge-amber/90">
            Introduction
          </p>
          <h1 className="font-display mt-2 text-3xl text-bridge-cream md:text-4xl">
            Introduction call
          </h1>
        </header>
        <section className="rounded-3xl border border-white/[0.08] bg-bridge-charcoal/90 p-6">
          <p className="text-sm leading-relaxed text-bridge-muted">
            {isConfig
              ? "LiveKit is not configured on the server. Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET, then restart the API and agent."
              : error}
          </p>
          {journey.connection_card && (
            <p className="mt-4 text-sm italic text-bridge-cream/80">{journey.connection_card}</p>
          )}
          <button
            type="button"
            className="btn-primary mt-6 w-full"
            disabled={completing}
            onClick={skipWithoutCall}
          >
            {completing ? "Finishing…" : "Continue without call (demo)"}
          </button>
        </section>
      </div>
    );
  }

  if (tokenLoading || !callToken?.token || !callToken.livekit_url) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-bridge-amber/25" />
        <p className="text-sm text-bridge-muted">Preparing your room…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="text-center md:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-bridge-amber/90">
          Wingman
        </p>
        <h1 className="font-display mt-2 text-3xl text-bridge-cream md:text-4xl">
          Introduction call
        </h1>
        {journey.scheduled_call_at && (
          <p className="mt-2 text-sm text-bridge-muted">
            Suggested time:{" "}
            <span className="text-bridge-cream/90">
              {new Date(journey.scheduled_call_at).toLocaleString(undefined, {
                weekday: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </p>
        )}
      </header>

      <WingmanCall
        matchId={journey.match_id}
        token={callToken.token}
        livekitUrl={callToken.livekit_url}
        partnerName={callToken.partner_display_name}
        connectionCard={journey.connection_card}
        onLeave={handleLeave}
      />
    </div>
  );
}
