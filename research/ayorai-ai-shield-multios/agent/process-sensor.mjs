import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createSecurityEvent } from "../runtime/event-core.mjs";

const execFileAsync = promisify(execFile);

export async function collectProcessSnapshot() {
  const platform = process.platform;
  const command = platform === "win32" ? ["tasklist", ["/FO","CSV","/NH"]] : ["ps", ["-eo","pid=,ppid=,comm="]];
  try {
    const { stdout } = await execFileAsync(command[0], command[1], { timeout: 3000, windowsHide: true, maxBuffer: 1024 * 1024 });
    const lines = stdout.split(/\r?\n/).filter(Boolean).slice(0, 200);
    return createSecurityEvent({
      platform,
      source: { sensor: "process", version: "0.1.0" },
      asset: { id: "local-endpoint", type: "endpoint" },
      actor: { type: "system" },
      action: { type: "observe", target: "process-table" },
      context: { sample_count: lines.length, collection: "read-only" },
      indicators: [],
      risk: { score: 0, confidence: 0.2 },
      decision: { action: "ALLOW", policy_id: "default-read-only" },
      response: { sample: lines }
    });
  } catch (error) {
    return createSecurityEvent({
      platform,
      source: { sensor: "process", version: "0.1.0" },
      action: { type: "observe", target: "process-table" },
      context: { collection: "read-only", collection_error: error.code || "unknown" },
      indicators: [],
      risk: { score: 0, confidence: 0 },
      decision: { action: "WARN", policy_id: "default-read-only" }
    });
  }
}
