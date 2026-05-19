const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail;
    const message = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d.msg).join(", ")
      : typeof detail === "string"
        ? detail
        : res.statusText;
    throw new Error(message || "API error");
  }
  return res.json();
}

export interface Persona {
  id: string;
  display_name: string;
  tagline: string;
  opener_examples: string[];
  elevenlabs_agent_id: string;
  sort_order: number;
}

export interface Journey {
  phase: string;
  persona_id: string | null;
  phase_started_at: string | null;
  phase_ends_at: string | null;
  summary_ready: boolean;
  match_reveal_delivered: boolean;
  match_id: string | null;
  scheduled_call_at: string | null;
  connection_card: string | null;
  elevenlabs_agent_id: string | null;
}

export interface TokenResponse {
  access_token: string;
  user_id: string;
  email: string;
}
