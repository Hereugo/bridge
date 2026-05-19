/** Real ElevenLabs convai agent IDs look like `agent_7101k5zvyjhmfg983brhmhkd98n6` (from the dashboard). */
export function isLikelyElevenLabsAgentId(agentId: string): boolean {
  return /^agent_[a-zA-Z0-9]{16,}$/.test(agentId.trim());
}
