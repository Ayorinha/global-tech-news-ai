import { randomUUID, createHash } from "node:crypto";

export const SCHEMA_VERSION = "1.0";

export function createSecurityEvent(input = {}) {
  const now = new Date().toISOString();
  const event = {
    schema_version: SCHEMA_VERSION,
    event_id: input.event_id || randomUUID(),
    timestamp: input.timestamp || now,
    platform: input.platform || process.platform,
    source: {
      sensor: input.source?.sensor || "endpoint",
      version: input.source?.version || "0.1.0"
    },
    asset: {
      id: input.asset?.id || "local-endpoint",
      type: input.asset?.type || "endpoint"
    },
    actor: {
      type: input.actor?.type || "system"
    },
    action: {
      type: input.action?.type || "observe",
      target: input.action?.target || "local"
    },
    context: sanitize(input.context || {}),
    indicators: Array.isArray(input.indicators) ? input.indicators : [],
    risk: {
      score: Number(input.risk?.score || 0),
      confidence: Number(input.risk?.confidence || 0)
    },
    decision: {
      action: input.decision?.action || "ALLOW",
      policy_id: input.decision?.policy_id || "default-read-only"
    },
    response: sanitize(input.response || {}),
    evidence: {
      hash: "",
      retention_class: input.evidence?.retention_class || "standard"
    }
  };
  event.evidence.hash = hashEvent(event);
  return Object.freeze(event);
}

export function hashEvent(event) {
  const copy = structuredClone(event);
  if (copy.evidence) copy.evidence.hash = "";
  return createHash("sha256").update(JSON.stringify(copy)).digest("hex");
}

export function validateSecurityEvent(event) {
  const required = ["schema_version","event_id","timestamp","platform","source","asset","actor","action","context","indicators","risk","decision","response","evidence"];
  const missing = required.filter(key => !(key in (event || {})));
  if (missing.length) throw new Error(`Missing event fields: ${missing.join(", ")}`);
  if (event.schema_version !== SCHEMA_VERSION) throw new Error("Unsupported schema version");
  if (!Number.isFinite(event.risk.score) || event.risk.score < 0 || event.risk.score > 1) throw new Error("Risk score must be between 0 and 1");
  if (!Number.isFinite(event.risk.confidence) || event.risk.confidence < 0 || event.risk.confidence > 1) throw new Error("Risk confidence must be between 0 and 1");
  return true;
}

function sanitize(value) {
  if (value === null || typeof value !== "object") return {};
  return JSON.parse(JSON.stringify(value, (_key, item) => {
    if (typeof item === "string" && item.length > 4096) return item.slice(0, 4096) + "…";
    return item;
  }));
}
