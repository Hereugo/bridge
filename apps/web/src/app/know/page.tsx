"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, Journey } from "@/lib/api";
import { ElevenLabsVoice } from "@/components/ElevenLabsVoice";
import type { StructuredSummary } from "@bridge/shared";

export default function KnowPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [reveal, setReveal] = useState<{
    match_ready: boolean;
    connection_card?: string;
    scheduled_call_at?: string;
    partner_first_name?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!session?.apiToken) return;
    const j = await apiFetch<Journey>("/journey/me", { token: session.apiToken });
    setJourney(j);
    if (j.phase === "MATCHED" || j.summary_ready) {
      const r = await apiFetch<{
        match_ready: boolean;
        connection_card?: string;
        scheduled_call_at?: string;
        partner_first_name?: string;
      }>("/journey/match-reveal", { token: session.apiToken });
      setReveal(r);
    }
  }, [session?.apiToken]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  async function registerConversation(conversationId: string) {
    if (!session?.user?.id) return;
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/webhooks/elevenlabs/conversation-id`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_id: session.user.id,
        }),
      }
    );
  }

  async function endWeekDemo() {
    if (!session?.apiToken || submitting) return;
    setSubmitting(true);
    const summary: StructuredSummary = {
      interests: ["live music", "coffee", "urban walks"],
      communication_style: "warm and curious",
      humour: "dry, gentle",
      energy_level: "evening person",
      availability: [
        { day: "friday", start: "19:00", end: "21:00" },
        { day: "saturday", start: "14:00", end: "17:00" },
      ],
      notes: "PoC demo summary",
    };
    try {
      await apiFetch("/journey/summary", {
        method: "POST",
        token: session.apiToken,
        body: JSON.stringify({ structured_summary: summary }),
      });
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  if (!journey) return <p className="text-bridge-muted">Loading…</p>;

  const endsAt = journey.phase_ends_at ? new Date(journey.phase_ends_at) : null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-bridge-amber">Know</p>
        <h1 className="font-display mt-2 text-3xl">Your companion</h1>
        {endsAt && (
          <p className="mt-2 text-sm text-bridge-muted">
            Phase ends {endsAt.toLocaleString()}
          </p>
        )}
      </header>

      {reveal?.match_ready && (
        <div className="card-surface border-bridge-amber/30">
          <p className="text-bridge-amber text-sm uppercase tracking-wide">Your companion says</p>
          <p className="mt-3 text-lg leading-relaxed">
            I&apos;ve been thinking — I know someone you&apos;d really click with
            {reveal.partner_first_name ? ` (${reveal.partner_first_name})` : ""}.
            {reveal.scheduled_call_at && (
              <>
                {" "}
                How about{" "}
                {new Date(reveal.scheduled_call_at).toLocaleString(undefined, {
                  weekday: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                ?
              </>
            )}
          </p>
          {reveal.connection_card && (
            <p className="mt-3 text-sm text-bridge-muted italic">{reveal.connection_card}</p>
          )}
          <button
            type="button"
            className="btn-primary mt-4 w-full"
            onClick={async () => {
              await apiFetch("/journey/advance-wingman", {
                method: "POST",
                token: session!.apiToken!,
              });
              router.push("/matched");
            }}
          >
            See introduction
          </button>
        </div>
      )}

      {journey.elevenlabs_agent_id && (
        <ElevenLabsVoice
          agentId={journey.elevenlabs_agent_id}
          onConversationStart={registerConversation}
        />
      )}

      <div className="card-surface">
        <p className="text-sm text-bridge-muted">
          Text fallback — type if voice isn&apos;t available.
        </p>
        <textarea
          className="mt-2 w-full rounded-lg border border-white/10 bg-bridge-night p-3 text-sm"
          rows={3}
          placeholder="Say something to your companion…"
        />
      </div>

      {process.env.NODE_ENV !== "production" && (
        <button
          type="button"
          className="btn-ghost w-full text-sm"
          disabled={submitting}
          onClick={endWeekDemo}
        >
          {submitting ? "Matching…" : "[Dev] End week & run matching"}
        </button>
      )}
    </div>
  );
}
