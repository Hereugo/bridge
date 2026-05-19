"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    ElevenLabsConvAI?: {
      startSession: (opts: { agentId: string; onConnect?: () => void }) => Promise<void>;
    };
  }
}

interface Props {
  agentId: string;
  onConversationStart?: (conversationId: string) => void;
}

/**
 * ElevenLabs Conversational AI embed.
 * Set NEXT_PUBLIC_ELEVENLABS_AGENT_ID or pass agentId from persona.
 * In production, load the official widget script from ElevenLabs docs.
 */
export function ElevenLabsVoice({ agentId, onConversationStart }: Props) {
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !agentId) return;
    started.current = true;

    const scriptId = "elevenlabs-convai";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://elevenlabs.io/convai-widget/index.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const convId = `conv_${Date.now()}`;
    onConversationStart?.(convId);
  }, [agentId, onConversationStart]);

  return (
    <div className="card-surface flex flex-col items-center gap-4 py-10">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bridge-amber/20">
        <span className="text-4xl">🎙</span>
      </div>
      <p className="text-center text-bridge-muted">
        Voice chat with your companion
        {agentId && agentId.includes("placeholder") && (
          <span className="mt-2 block text-xs text-bridge-amber">
            Configure ELEVENLABS agent ID in personas table
          </span>
        )}
      </p>
      {/* @ts-expect-error custom element */}
      <elevenlabs-convai agent-id={agentId} />
    </div>
  );
}
