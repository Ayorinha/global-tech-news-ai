import { stat } from "node:fs/promises";
import { createSecurityEvent } from "../runtime/event-core.mjs";

export async function inspectFile(targetPath) {
  try {
    const info = await stat(targetPath);
    return createSecurityEvent({
      platform: process.platform,
      source: { sensor: "file", version: "0.1.0" },
      asset: { id: "local-endpoint", type: "endpoint" },
      actor: { type: "system" },
      action: { type: "observe", target: "file-metadata" },
      context: { target_type: info.isDirectory() ? "directory" : "file", size_bytes: info.size, mode: info.mode, modified_at: info.mtime.toISOString(), collection: "read-only" },
      indicators: [],
      risk: { score: 0, confidence: 0.2 },
      decision: { action: "ALLOW", policy_id: "default-read-only" }
    });
  } catch (error) {
    return createSecurityEvent({
      platform: process.platform,
      source: { sensor: "file", version: "0.1.0" },
      action: { type: "observe", target: "file-metadata" },
      context: { collection: "read-only", collection_error: error.code || "unknown" },
      indicators: [],
      risk: { score: 0, confidence: 0 },
      decision: { action: "WARN", policy_id: "default-read-only" }
    });
  }
}
