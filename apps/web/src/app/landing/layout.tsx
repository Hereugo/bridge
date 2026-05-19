import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge — Meet interesting people",
  description:
    "AI-powered matchmaking for real human friendships. Pick a vibe, chat by voice, get a warm introduction — then we step aside.",
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className="landing-full-bleed -my-8 min-h-screen">{children}</div>;
}
