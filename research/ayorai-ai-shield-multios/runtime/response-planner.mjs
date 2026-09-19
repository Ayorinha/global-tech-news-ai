export const RESPONSE_PLANNER_VERSION = "0.1.0";

const HIGH_IMPACT = new Set(["BLOCK","QUARANTINE","ISOLATE"]);

export function planResponse(event, requestedAction = "observe") {
  const action = String(requestedAction).toUpperCase();
  if (!HIGH_IMPACT.has(action)) {
    return { planner_version: RESPONSE_PLANNER_VERSION, action: "OBSERVE", requires_approval: false, executed: false };
  }
  return {
    planner_version: RESPONSE_PLANNER_VERSION,
    action,
    requires_approval: true,
    executed: false,
    reason: "Research runtime never performs high-impact endpoint actions automatically."
  };
}
