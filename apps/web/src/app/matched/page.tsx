"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, Journey } from "@/lib/api";

export default function MatchedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.apiToken) return;
    apiFetch<Journey>("/journey/me", { token: session.apiToken }).then(setJourney);
  }, [session?.apiToken]);

  if (!journey) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-bridge-amber/25" />
        <p className="text-sm text-bridge-muted">Loading your introduction…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <header className="text-center md:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-bridge-amber/90">
          Introduction
        </p>
        <h1 className="font-display mt-2 text-3xl text-bridge-cream md:text-4xl">
          You&apos;re being introduced
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-bridge-muted md:mx-0">
          When you&apos;re ready, join the private call. A quiet companion is there only if the
          conversation needs a nudge.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-bridge-amber/25 bg-gradient-to-br from-bridge-amber/10 to-transparent p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-bridge-amber">
          Your connection card
        </p>
        <p className="mt-4 text-lg leading-relaxed text-bridge-cream">
          {journey.connection_card || "Your connection card is being prepared…"}
        </p>
        {journey.scheduled_call_at && (
          <p className="mt-4 text-sm text-bridge-muted">
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
      </section>

      <button
        type="button"
        className="btn-primary mx-auto flex min-h-[52px] w-full max-w-md items-center justify-center text-base"
        disabled={joining || !journey.match_id}
        onClick={async () => {
          if (!session?.apiToken) return;
          setJoining(true);
          try {
            await apiFetch("/journey/advance-wingman", {
              method: "POST",
              token: session.apiToken,
            });
            router.push("/call");
          } finally {
            setJoining(false);
          }
        }}
      >
        {joining ? "Opening call…" : "Join introduction call"}
      </button>
    </div>
  );
}
