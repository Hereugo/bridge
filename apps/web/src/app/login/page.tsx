"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { apiFetch, TokenResponse } from "@/lib/api";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    apiFetch<TokenResponse>("/auth/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then((data) =>
        signIn("magic-link", {
          redirect: false,
          apiToken: data.access_token,
          userId: data.user_id,
          email: data.email,
        })
      )
      .then((res) => {
        if (res?.ok) router.replace("/onboarding");
        else setError("Sign in failed");
      })
      .catch(() => setError("Invalid or expired link"));
  }, [searchParams, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await apiFetch<{ dev_link?: string }>("/auth/magic-link", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
      if (res.dev_link) setDevLink(res.dev_link);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send link");
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <h1 className="font-display text-4xl text-bridge-cream">Bridge</h1>
      <p className="mt-2 text-bridge-muted">Meet someone worth talking to.</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-bridge-charcoal px-4 py-3 text-bridge-cream outline-none focus:border-bridge-amber/50"
        />
        <button type="submit" className="btn-primary w-full">
          Send magic link
        </button>
      </form>

      {sent && (
        <p className="mt-4 text-sm text-bridge-muted">
          Check your email. In dev, use the link below.
        </p>
      )}
      {devLink && (
        <a href={devLink} className="mt-2 block text-sm text-bridge-amber underline">
          {devLink}
        </a>
      )}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-bridge-muted">Loading…</p>}>
      <LoginForm />
    </Suspense>
  );
}
