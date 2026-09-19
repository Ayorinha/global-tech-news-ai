import assert from "node:assert/strict";
import { createSecurityEvent, validateSecurityEvent, hashEvent } from "../runtime/event-core.mjs";
import { scoreRisk } from "../runtime/risk-engine.mjs";
import { decide } from "../runtime/policy-engine.mjs";
import { snapshotEndpoint } from "../agent/read-only-agent.mjs";

const event = createSecurityEvent({
  platform: "linux",
  indicators: ["tool_abuse"],
  context: { privileged: true },
  action: { type: "observe", target: "local" }
});
assert.equal(validateSecurityEvent(event), true);
assert.equal(event.evidence.hash, hashEvent(event));
assert.equal(scoreRisk(["tool_abuse"], { privileged: true }).score, 0.94);
assert.equal(decide({ risk: 0.94, requestedAction: "observe" }).action, "WARN");
const snapshot = snapshotEndpoint();
assert.equal(validateSecurityEvent(snapshot), true);
console.log("AYORAI runtime validation: PASSED");
