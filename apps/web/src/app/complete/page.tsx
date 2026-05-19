"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function CompletePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  async function deleteAccount() {
    if (!session?.apiToken) return;
    await apiFetch("/users/me", { method: "DELETE", token: session.apiToken });
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-center space-y-6 text-center">
      <h1 className="font-display text-3xl">You&apos;re connected</h1>
      <p className="text-bridge-muted">
        The wingman has stepped aside. What happens next is between you two.
      </p>
      <p className="text-xs text-bridge-muted">
        Session data from this introduction has been scheduled for deletion.
      </p>
      <button type="button" className="btn-ghost" onClick={() => signOut({ callbackUrl: "/login" })}>
        Sign out
      </button>
      <button type="button" className="text-xs text-red-400/80 underline" onClick={deleteAccount}>
        Delete my data
      </button>
    </div>
  );
}
