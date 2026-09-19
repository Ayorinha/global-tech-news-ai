import os from "node:os";
import { createSecurityEvent } from "../runtime/event-core.mjs";

export function collectNetworkSnapshot() {
  const interfaces = os.networkInterfaces();
  const summary = Object.entries(interfaces).map(([name, values]) => ({
    name,
    address_count: Array.isArray(values) ? values.length : 0,
    families: [...new Set((values || []).map(v => v.family))]
  }));
  return createSecurityEvent({
    platform: process.platform,
    source: { sensor: "network", version: "0.1.0" },
    asset: { id: "local-endpoint", type: "endpoint" },
    actor: { type: "system" },
    action: { type: "observe", target: "network-interfaces" },
    context: { interface_count: summary.length, interfaces: summary, collection: "read-only", sensitive_addresses_stored: false },
    indicators: [],
    risk: { score: 0, confidence: 0.2 },
    decision: { action: "ALLOW", policy_id: "default-read-only" }
  });
}
