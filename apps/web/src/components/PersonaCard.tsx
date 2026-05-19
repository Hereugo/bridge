import { Persona } from "@/lib/api";

export function PersonaCard({ persona }: { persona: Persona }) {
  return (
    <article className="card-surface relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-bridge-amber/10 blur-2xl" />
      <h2 className="font-display text-2xl text-bridge-cream">{persona.display_name}</h2>
      <p className="mt-2 text-bridge-muted">{persona.tagline}</p>
      <div className="mt-6 space-y-2">
        <p className="text-xs uppercase tracking-wider text-bridge-amber/80">They might ask</p>
        {persona.opener_examples.map((q) => (
          <p key={q} className="rounded-lg bg-bridge-night/50 px-3 py-2 text-sm italic text-bridge-cream/80">
            &ldquo;{q}&rdquo;
          </p>
        ))}
      </div>
    </article>
  );
}
