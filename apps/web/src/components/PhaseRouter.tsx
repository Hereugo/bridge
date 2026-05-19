"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, Journey } from "@/lib/api";

export function PhaseRouter() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status !== "authenticated" || !session?.apiToken) return;

    apiFetch<Journey>("/journey/me", { token: session.apiToken })
      .then((j) => {
        switch (j.phase) {
          case "ONBOARDING":
            router.replace("/onboarding");
            break;
          case "SWIPE":
            router.replace(j.persona_id ? "/know" : "/swipe");
            break;
          case "KNOW":
          case "MATCHING":
            router.replace("/know");
            break;
          case "MATCHED":
            router.replace("/matched");
            break;
          case "WINGMAN":
            router.replace("/call");
            break;
          case "COMPLETE":
            router.replace("/complete");
            break;
          default:
            router.replace("/onboarding");
        }
      })
      .catch(() => router.replace("/onboarding"))
      .finally(() => setLoading(false));
  }, [status, session, router]);

  if (!loading && status !== "loading") return null;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <LoadingSpinner />
      <p className="text-bridge-muted">Finding your path…</p>
    </div>
  );
}

function LoadingSpinner() {
  return <div className="h-10 w-10 animate-pulse rounded-full bg-bridge-amber/30" />;
}
