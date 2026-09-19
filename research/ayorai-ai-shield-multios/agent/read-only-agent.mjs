import os from "node:os";
import process from "node:process";
import { createSecurityEvent } from "../runtime/event-core.mjs";

export function snapshotEndpoint() {
  return createSecurityEvent({
    platform: process.platform,
    source: { sensor: "endpoint", version: "0.1.0" },
    asset: { id: os.hostname(), type: "endpoint" },
    actor: { type: "system" },
    action: { type: "observe", target: "endpoint" },
    context: {
      hostname: os.hostname(),
      arch: process.arch,
      node_version: process.version,
      uptime_seconds: Math.round(os.uptime()),
      cpu_count: os.cpus().length,
      memory_bytes: os.totalmem()
    },
    indicators: [],
    risk: { score: 0, confidence: 0.2 },
    decision: { action: "ALLOW", policy_id: "default-read-only" }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(snapshotEndpoint(), null, 2));
}
