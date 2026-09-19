import { AyoraiAIShield } from "./bridge.mjs";

export function evaluateAgentInteraction({ prompt = "", context = "", toolCall = "", output = "" } = {}) {
  const result = AyoraiAIShield.analyze({ prompt, context, toolCall, output });
  return {
    layer: "agent-security",
    allowed_to_continue: result.decision === "ALLOW",
    requires_review: result.decision === "BLOCK",
    engine: result.shield,
    risk_score: result.risk_score,
    rule_ids: result.rule_ids,
    result
  };
}
