"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  async function handleContinue() {
    if (!session?.apiToken) return;
    setLoading(true);
    try {
      await apiFetch("/journey/complete-onboarding", {
        method: "POST",
        token: session.apiToken,
      });
      router.push("/swipe");
    } finally {
      setLoading(false);
    }
  }

  if (status !== "authenticated") {
    return <p className="text-bridge-muted">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-widest text-bridge-amber">Welcome</p>
        <h1 className="font-display mt-2 text-3xl">Before we begin</h1>
      </header>

      <div className="card-surface space-y-4 text-bridge-cream/90">
        <p className="text-lg leading-relaxed">
          Bridge helps you meet interesting people — not through profiles or scores, but through a
          real introduction.
        </p>
        <ul className="space-y-3 text-sm text-bridge-muted">
          <li className="flex gap-2">
            <span className="text-bridge-amber">◆</span>
            Your companion has no long-term memory — conversations are summarized, then deleted.
          </li>
          <li className="flex gap-2">
            <span className="text-bridge-amber">◆</span>
            We never sell your data or build an emotional profile on you.
          </li>
          <li className="flex gap-2">
            <span className="text-bridge-amber">◆</span>
            Raw voice data is removed after each phase. Only what’s needed for your match moves
            forward.
          </li>
          <li className="flex gap-2">
            <span className="text-bridge-amber">◆</span>
            The AI steps aside once you’ve met — this is about human connection.
          </li>
        </ul>
      </div>

      <button
        type="button"
        className="btn-primary w-full"
        disabled={loading}
        onClick={handleContinue}
      >
        {loading ? "Saving…" : "I understand — let's go"}
      </button>

      <p className="text-center text-xs text-bridge-muted">
        Signed in as {session?.user?.email}
      </p>
    </div>
  );
}
