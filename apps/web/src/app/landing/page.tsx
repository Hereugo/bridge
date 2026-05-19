import Link from "next/link";

const phases = [
  {
    id: "swipe",
    number: "01",
    title: "Swipe",
    tagline: "Pick a vibe",
    duration: "One-time onboarding",
    description:
      "Browse a handful of AI personas — each with a name, personality sketch, and conversation openers. Swipe or tap the style that feels right. No profiles to polish, no questionnaire.",
    detail: "Only your chosen persona ID is stored. Nothing else from this step.",
  },
  {
    id: "know",
    number: "02",
    title: "Know",
    tagline: "A week of conversation",
    duration: "~7 days",
    description:
      "Talk with your companion by voice — natural, free-flowing dialogue about interests, humour, energy, and when you're free. The AI learns through chat, never through direct profiling questions.",
    detail:
      "At week's end, a structured summary is created and raw voice data is permanently deleted. Matching begins in the background during the final days.",
  },
  {
    id: "match",
    number: "03",
    title: "Match",
    tagline: "Warm introduction",
    duration: "Automated in background",
    description:
      "A separate matching system pairs you on compatibility and schedule overlap — it only ever reads summaries, never transcripts. Your companion reveals the match in conversation, like a friend saying: I know someone you'd click with.",
    detail:
      "Summaries are deleted after matching. A short connection card — two or three warm sentences about what you share — is all that moves forward.",
  },
  {
    id: "wingman",
    number: "04",
    title: "Wingman",
    tagline: "One call, then we're gone",
    duration: "Single scheduled session",
    description:
      "You and your match join a three-way call with a wingman AI that stays quiet unless the conversation stalls — then it offers a shared topic, casually. When you're flowing, it leaves with a warm send-off.",
    detail: "All session data is deleted on departure. You keep a direct line to each other.",
  },
] as const;

const principles = [
  {
    title: "Meet people, not fix a problem",
    body: "Bridge is framed around interesting conversations and real introductions — never as a clinical or diagnostic service. What you experience is low-stakes and human.",
  },
  {
    title: "Privacy by design",
    body: "No persistent emotional profile. Raw conversation data is deleted at the end of each phase. The matching AI reads summaries only — not transcripts. Transparency is part of the pitch, not buried in fine print.",
  },
  {
    title: "AI enables, humans connect",
    body: "The AI's job is to disappear. It warms up the connection, facilitates one introduction, and steps aside. Success means you no longer need the product.",
  },
] as const;

function PhaseIcon({ id }: { id: (typeof phases)[number]["id"] }) {
  const className = "h-6 w-6";
  switch (id) {
    case "swipe":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      );
    case "know":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      );
    case "match":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      );
    case "wingman":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.106-4.028-.3C2.697 15.753 2.25 14.444 2.25 12v-2.25c0-1.136.847-2.1 1.98-2.193a48.114 48.114 0 013.93-.303"
          />
        </svg>
      );
  }
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-bridge-amber/12 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-bridge-amber/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-10 border-b border-white/[0.06] bg-bridge-night/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/landing" className="font-display text-2xl text-bridge-cream">
            Bridge
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-bridge-muted sm:flex">
            <a href="#how-it-works" className="transition hover:text-bridge-cream">
              How it works
            </a>
            <a href="#principles" className="transition hover:text-bridge-cream">
              Principles
            </a>
            <a href="#privacy" className="transition hover:text-bridge-cream">
              Privacy
            </a>
          </nav>
          <Link href="/login" className="btn-primary px-5 py-2.5 text-sm">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:pb-28">
        <div className="mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-bridge-amber/25 bg-bridge-amber/[0.08] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-bridge-amber">
            <span className="h-1.5 w-1.5 rounded-full bg-bridge-amber" />
            Rotterdam · Amsterdam · The Hague
          </p>
          <h1 className="mt-8 max-w-3xl font-display text-4xl leading-[1.1] text-bridge-cream sm:text-5xl lg:text-6xl">
            Meet someone worth
            <span className="text-bridge-amber"> talking to</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bridge-muted sm:text-xl">
            Bridge is AI-powered matchmaking for real human friendships. Pick a conversation style,
            chat by voice for a week, get a warm introduction — then we step aside so the
            connection is yours.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/login" className="btn-primary inline-flex justify-center px-8 py-3.5 text-base shadow-lg shadow-bridge-amber/15">
              Start your journey
            </Link>
            <a href="#how-it-works" className="btn-ghost inline-flex justify-center px-8 py-3.5 text-base">
              See how it works
            </a>
          </div>
          <ul className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              { stat: "4 phases", label: "One clear path from hello to human connection" },
              { stat: "Voice-first", label: "Natural conversation — text when you need it" },
              { stat: "Zero dossier", label: "No long-term memory, no emotional profile stored" },
            ].map((item) => (
              <li
                key={item.stat}
                className="rounded-2xl border border-white/[0.06] bg-bridge-charcoal/50 px-5 py-4 backdrop-blur-sm"
              >
                <p className="font-display text-xl text-bridge-amber">{item.stat}</p>
                <p className="mt-1 text-sm leading-relaxed text-bridge-muted">{item.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Vision */}
      <section className="relative z-10 border-y border-white/[0.06] bg-bridge-charcoal/40 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bridge-amber">The vision</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-bridge-cream sm:text-4xl">
              AI that disappears once you&apos;ve met
            </h2>
          </div>
          <p className="text-base leading-relaxed text-bridge-muted sm:text-lg">
            Municipalities invest in community programmes, but uptake stays low — often because
            anything framed as a &ldquo;solution&rdquo; attracts only a self-selected few. Bridge
            flips the framing: residents experience a fun, low-stakes way to meet interesting people.
            Behind the scenes, cities get a measurable path to stronger social connection at scale —
            without surveillance, diagnosis, or replacing human relationships with chatbots.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-bridge-amber">
            The journey
          </p>
          <h2 className="mt-3 text-center font-display text-3xl text-bridge-cream sm:text-4xl">
            Four phases, one human introduction
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-bridge-muted">
            Every phase has a single job. Data is scoped tightly — only what&apos;s needed for the
            next step is kept, then deleted.
          </p>

          <ol className="mt-16 space-y-6">
            {phases.map((phase, i) => (
              <li
                key={phase.id}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-bridge-charcoal/90 to-bridge-night/80 p-6 shadow-xl transition hover:border-bridge-amber/20 sm:p-8 lg:grid lg:grid-cols-[auto_1fr] lg:gap-8"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-bridge-amber/5 blur-2xl transition group-hover:bg-bridge-amber/10"
                  aria-hidden
                />
                <div className="flex items-start gap-4 lg:flex-col lg:items-center lg:gap-3">
                  <span className="font-display text-4xl text-bridge-amber/40">{phase.number}</span>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bridge-amber/15 text-bridge-amber">
                    <PhaseIcon id={phase.id} />
                  </div>
                </div>
                <div className="mt-4 lg:mt-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-2xl text-bridge-cream">{phase.title}</h3>
                    <span className="text-sm text-bridge-amber">{phase.tagline}</span>
                    <span className="w-full text-xs uppercase tracking-wider text-bridge-muted sm:ml-auto sm:w-auto">
                      {phase.duration}
                    </span>
                  </div>
                  <p className="mt-3 leading-relaxed text-bridge-cream/90">{phase.description}</p>
                  <p className="mt-3 rounded-xl border border-white/[0.05] bg-bridge-night/50 px-4 py-3 text-sm text-bridge-muted">
                    {phase.detail}
                  </p>
                </div>
                {i < phases.length - 1 && (
                  <div
                    className="absolute -bottom-3 left-1/2 hidden h-6 w-px -translate-x-1/2 bg-gradient-to-b from-bridge-amber/40 to-transparent lg:block"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Principles */}
      <section id="principles" className="relative z-10 scroll-mt-20 bg-bridge-charcoal/30 px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-bridge-amber">
            Design principles
          </p>
          <h2 className="mt-3 text-center font-display text-3xl text-bridge-cream sm:text-4xl">
            Built for trust from day one
          </h2>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {principles.map((p) => (
              <li key={p.title} className="card-surface flex flex-col">
                <div className="mb-4 h-1 w-12 rounded-full bg-bridge-amber" />
                <h3 className="font-display text-xl text-bridge-cream">{p.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-bridge-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* AI components */}
      <section className="relative z-10 px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-bridge-charcoal via-bridge-charcoal to-bridge-night p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bridge-amber/90">
              Under the hood
            </p>
            <h2 className="mt-3 font-display text-3xl text-bridge-cream">Three AIs, three jobs</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-3">
              {[
                {
                  role: "Companion",
                  when: "Phase 2 — Know",
                  text: "4–6 distinct personas with their own voice and style. They chat naturally, never as therapy, and forget everything once the summary is written.",
                },
                {
                  role: "Matcher",
                  when: "Phase 3 — Match",
                  text: "A separate system that only reads structured summaries. It scores compatibility and schedule overlap, then writes a connection card that sounds like a mutual friend.",
                },
                {
                  role: "Wingman",
                  when: "Phase 4 — Wingman",
                  text: "Joins the intro call with read-only access to connection cards. Silent when you're flowing; helpful when you're not. Deletes everything on exit.",
                },
              ].map((ai) => (
                <li key={ai.role} className="rounded-2xl border border-white/[0.06] bg-bridge-night/40 p-5">
                  <p className="font-display text-lg text-bridge-amber">{ai.role}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-bridge-muted">{ai.when}</p>
                  <p className="mt-3 text-sm leading-relaxed text-bridge-cream/85">{ai.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="relative z-10 scroll-mt-20 border-t border-white/[0.06] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bridge-amber">Privacy & compliance</p>
            <h2 className="mt-3 font-display text-3xl text-bridge-cream sm:text-4xl">
              Radical transparency is the product
            </h2>
            <p className="mt-4 leading-relaxed text-bridge-muted">
              GDPR-aligned by design: legitimate interest plus explicit consent at onboarding,
              framed as meeting interesting people. You can exit any phase and all data is deleted
              immediately. Bridge does not classify users by emotional state for access or scoring —
              companions infer only enough to facilitate one introduction.
            </p>
          </div>
          <ul className="mt-10 space-y-4 lg:mt-0">
            {[
              "No persistent emotional profile — ever",
              "Raw voice and chat deleted at the end of each phase",
              "Matching AI reads summaries only, never transcripts",
              "Wingman session wiped when the AI departs",
              "Your data is never sold or used for ads",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm text-bridge-cream/95 sm:text-base">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bridge-amber/20 text-bridge-amber">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Audience */}
      <section className="relative z-10 px-5 pb-8 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-bridge-amber/20 bg-bridge-amber/[0.06] px-6 py-10 text-center sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-bridge-amber">Who it&apos;s for</p>
          <p className="mx-auto mt-4 max-w-2xl font-display text-2xl leading-snug text-bridge-cream sm:text-3xl">
            Urban adults in the Netherlands, ages 20–35
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-bridge-muted sm:text-base">
            A proof-of-concept built for digital-native city residents — the interaction model is
            immediately familiar, and the focus is one thoughtful one-to-one introduction at a time.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-display text-3xl text-bridge-cream sm:text-4xl">Ready to pick a vibe?</h2>
          <p className="mx-auto mt-4 max-w-md text-bridge-muted">
            Sign in with your email. The whole journey starts with choosing who you&apos;d like to talk to first.
          </p>
          <Link
            href="/login"
            className="btn-primary mt-8 inline-flex px-10 py-3.5 text-base shadow-lg shadow-bridge-amber/15"
          >
            Get started
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] px-5 py-8 text-center text-sm text-bridge-muted sm:px-8">
        <p>Bridge — Hackathon proof of concept · Coalition of Dutch municipalities</p>
        <p className="mt-2">
          <Link href="/login" className="text-bridge-amber underline-offset-2 hover:underline">
            Sign in
          </Link>
          {" · "}
          <Link href="/" className="underline-offset-2 hover:underline">
            Open app
          </Link>
        </p>
      </footer>
    </div>
  );
}
