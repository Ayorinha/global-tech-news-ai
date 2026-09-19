export const POLICY_ENGINE_VERSION = "0.1.0";

export const DEFAULT_POLICY = Object.freeze({
  id: "default-read-only",
  version: "1.0.0",
  mode: "observe",
  block_threshold: 0.85,
  warn_threshold: 0.55,
  require_approval_above: 0.70
});

export function decide({ risk = 0, policy = DEFAULT_POLICY, requestedAction = "observe" } = {}) {
  if (requestedAction === "isolate" || requestedAction === "quarantine") {
    return { action: risk >= policy.require_approval_above ? "ESCALATE" : "WARN", policy_id: policy.id, policy_version: policy.version, reason: "High-impact response requires explicit approval." };
  }
  if (risk >= policy.block_threshold && policy.mode !== "observe") return { action: "BLOCK", policy_id: policy.id, policy_version: policy.version, reason: "Risk exceeded policy threshold." };
  if (risk >= policy.warn_threshold) return { action: "WARN", policy_id: policy.id, policy_version: policy.version, reason: "Risk exceeded warning threshold." };
  return { action: "ALLOW", policy_id: policy.id, policy_version: policy.version, reason: "No policy threshold exceeded." };
}
