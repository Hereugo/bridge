"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

function StepDots({ active }: { active: 0 | 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === active ? "w-6 bg-bridge-amber" : "w-1.5 bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}

function TrustRow({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-white/[0.06] bg-bridge-night/40 p-4">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bridge-amber/12 text-bridge-amber"
        aria-hidden
      >
        {icon}
      </div>
      <div>
        <p className="font-medium text-bridge-cream">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-bridge-muted">{children}</p>
      </div>
    </div>
  );
}

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
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-bridge-amber/25" />
        <p className="text-sm text-bridge-muted">Opening…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <StepDots active={0} />

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-bridge-charcoal via-bridge-charcoal to-bridge-night px-6 pb-8 pt-10 shadow-2xl">
        <div
          className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-bridge-amber/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-bridge-amber/8 blur-3xl"
          aria-hidden
        />

        <p className="relative text-center text-xs font-medium uppercase tracking-[0.2em] text-bridge-amber/90">
          How Bridge works
        </p>
        <h1 className="relative mt-3 text-center font-display text-3xl leading-tight text-bridge-cream md:text-4xl">
          A warm intro,
          <br />
          <span className="text-bridge-amber/95">not a questionnaire</span>
        </h1>
        <p className="relative mx-auto mt-4 max-w-md text-center text-[15px] leading-relaxed text-bridge-muted">
          You’ll meet someone real — we just help break the ice. Here’s what stays on your device,
          what leaves with you, and what comes next.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-bridge-amber/20 bg-bridge-amber/[0.06] p-5">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-bridge-amber">
          What happens next
        </p>
        <ol className="mt-4 space-y-4 text-sm text-bridge-cream/95">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bridge-amber text-xs font-bold text-bridge-night">
              1
            </span>
            <span>
              <strong className="text-bridge-cream">Pick a vibe</strong> — browse a few conversation
              styles and tap who you’d like to get to know. No profiles to polish.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-bridge-cream">
              2
            </span>
            <span>
              <strong className="text-bridge-cream">Chat inside Bridge</strong> — everything happens
              in this app. When you’re ready, you can use voice for a natural back-and-forth; typing
              stays there if you prefer it.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-bridge-cream">
              3
            </span>
            <span>
              <strong className="text-bridge-cream">We step back</strong> — when it’s time to meet
              another person, we’re only there to nudge the conversation if it stalls.
            </span>
          </li>
        </ol>
      </div>

      <div className="mt-8 space-y-3">
        <TrustRow
          title="No long-term memory"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        >
          Your companion learns enough to make a thoughtful intro, then summaries replace raw
          chat — we don’t keep a running dossier on you.
        </TrustRow>
        <TrustRow
          title="Your data isn’t the product"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          }
        >
          We don’t sell what you share or score you on mood. What we keep is only what’s needed to
          make one good human introduction.
        </TrustRow>
        <TrustRow
          title="Voice & text, your pace"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18.75c-4.556 0-8.25-3.694-8.25-8.25S7.444 2.25 12 2.25s8.25 3.694 8.25 8.25m0 0c0 2.561-2.175 4.5-4.5 4.5h-2.25a2.25 2.25 0 00-2.25 2.25M19.5 8.25h.008v.008H19.5V8.25z"
              />
            </svg>
          }
        >
          Nothing starts like a phone call you didn’t ask for — you open the chat when it feels
          right, and the mic is optional until then.
        </TrustRow>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-10 pb-2">
        <button
          type="button"
          className="btn-primary w-full py-3.5 text-base shadow-lg shadow-bridge-amber/10"
          disabled={loading}
          onClick={handleContinue}
        >
          {loading ? "One moment…" : "Continue"}
        </button>
        <p className="text-center text-sm text-bridge-muted">
          Next: choose who you&apos;d like to talk to
        </p>
        <p className="text-center text-[11px] text-bridge-muted/70">
          {session?.user?.email}
        </p>
      </div>
    </div>
  );
}
