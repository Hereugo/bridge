"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiFetch, Persona } from "@/lib/api";
import { PersonaCard } from "@/components/PersonaCard";

export default function SwipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.apiToken) return;
    apiFetch<Persona[]>("/personas", { token: session.apiToken })
      .then(setPersonas)
      .finally(() => setLoading(false));
  }, [session?.apiToken]);

  const selectPersona = useCallback(
    async (personaId: string) => {
      if (!session?.apiToken || selecting) return;
      setSelecting(true);
      try {
        await apiFetch("/journey/select-persona", {
          method: "POST",
          token: session.apiToken,
          body: JSON.stringify({ persona_id: personaId, consent: true }),
        });
        router.push("/know");
      } catch {
        setSelecting(false);
      }
    },
    [session?.apiToken, selecting, router]
  );

  if (loading) return <p className="text-bridge-muted">Loading personas…</p>;
  if (!personas.length) return <p className="text-bridge-muted">No personas available.</p>;

  const current = personas[index % personas.length];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-bridge-amber">Pick a vibe</p>
        <h1 className="font-display mt-2 text-3xl">Who do you want to meet first?</h1>
        <p className="mt-2 text-bridge-muted">
          Swipe through — you&apos;re choosing a conversation style, not taking a test.
        </p>
      </header>

      <PersonaCard persona={current} />

      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1" onClick={() => setIndex((i) => i + 1)}>
          Next ({index + 1}/{personas.length})
        </button>
        <button
          type="button"
          className="btn-primary flex-1"
          disabled={selecting}
          onClick={() => selectPersona(current.id)}
        >
          {selecting ? "Starting…" : "Talk to them"}
        </button>
      </div>
    </div>
  );
}
