"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, Journey } from "@/lib/api";

export default function MatchedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [journey, setJourney] = useState<Journey | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.apiToken) return;
    apiFetch<Journey>("/journey/me", { token: session.apiToken }).then(setJourney);
  }, [session?.apiToken]);

  if (!journey) return <p className="text-bridge-muted">Loading…</p>;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-widest text-bridge-amber">Introduction</p>
        <h1 className="font-display mt-2 text-3xl">You&apos;re being introduced</h1>
      </header>

      <div className="card-surface">
        <p className="text-lg leading-relaxed text-bridge-cream/95">
          {journey.connection_card || "Your connection card is being prepared…"}
        </p>
        {journey.scheduled_call_at && (
          <p className="mt-4 text-bridge-muted">
            Call scheduled:{" "}
            <span className="text-bridge-cream">
              {new Date(journey.scheduled_call_at).toLocaleString()}
            </span>
          </p>
        )}
      </div>

      <button
        type="button"
        className="btn-primary w-full"
        onClick={async () => {
          await apiFetch("/journey/advance-wingman", {
            method: "POST",
            token: session!.apiToken!,
          });
          router.push("/call");
        }}
      >
        Join introduction call
      </button>
    </div>
  );
}
