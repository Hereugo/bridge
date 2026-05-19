"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, Journey } from "@/lib/api";
import { ElevenLabsVoice } from "@/components/ElevenLabsVoice";
import type { StructuredSummary } from "@bridge/shared";

const showDevTools =
  process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === "true" ||
  process.env.NODE_ENV !== "production";

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

  if (!journey) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-bridge-amber/25" />
        <p className="text-sm text-bridge-muted">Loading your space…</p>
      </div>
    );
  }

  const endsAt = journey.phase_ends_at ? new Date(journey.phase_ends_at) : null;

  return (
    <div className="space-y-8 pb-8">
      <header className="text-center md:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-bridge-amber/90">Know</p>
        <h1 className="font-display mt-2 text-3xl text-bridge-cream md:text-4xl">Your week together</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bridge-muted md:mx-0">
          Take your time — this is a low-key hang, not an interview. Voice and typing both live
          here in Bridge.
        </p>
        {endsAt && (
          <p className="mt-3 text-xs text-bridge-muted/90">
            This chapter wraps{" "}
            <span className="text-bridge-cream/80">
              {endsAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </p>
        )}
      </header>

      {reveal?.match_ready && (
        <div className="relative overflow-hidden rounded-2xl border border-bridge-amber/35 bg-gradient-to-br from-bridge-amber/10 to-transparent p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-bridge-amber">
            Something good
          </p>
          <p className="mt-3 text-lg leading-relaxed text-bridge-cream">
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
            <p className="mt-3 text-sm italic leading-relaxed text-bridge-muted">{reveal.connection_card}</p>
          )}
          <button
            type="button"
            className="btn-primary mt-5 w-full md:w-auto md:min-w-[200px]"
            onClick={() => router.push("/matched")}
          >
            See introduction
          </button>
        </div>
      )}

      {journey.elevenlabs_agent_id && (
        <ElevenLabsVoice
          agentId={journey.elevenlabs_agent_id}
          apiToken={session?.apiToken}
          onConversationStart={registerConversation}
        />
      )}

      <div className="rounded-2xl border border-white/[0.06] bg-bridge-charcoal/40 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-bridge-cream">Message</p>
          <p className="text-xs text-bridge-muted">Optional — if you&apos;d rather type</p>
        </div>
        <textarea
          className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-bridge-night/80 px-4 py-3 text-sm text-bridge-cream outline-none ring-bridge-amber/30 transition placeholder:text-bridge-muted/50 focus:border-bridge-amber/40 focus:ring-2"
          rows={4}
          placeholder="Type here anytime — same thread as your voice chat…"
        />
      </div>

      {showDevTools && (
        <button
          type="button"
          className="btn-ghost w-full text-sm opacity-80"
          disabled={submitting}
          onClick={endWeekDemo}
        >
          {submitting ? "Matching…" : "[Dev] End week & run matching"}
        </button>
      )}
    </div>
  );
}
