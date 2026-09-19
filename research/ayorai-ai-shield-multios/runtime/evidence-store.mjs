import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { validateSecurityEvent } from "./event-core.mjs";

export function createEvidenceStore(directory) {
  return {
    async append(event) {
      validateSecurityEvent(event);
      await mkdir(directory, { recursive: true });
      const file = path.join(directory, "events.jsonl");
      await appendFile(file, JSON.stringify(event) + "\n", "utf8");
      return { file, event_id: event.event_id, hash: event.evidence.hash };
    },
    async list() {
      try {
        const content = await readFile(path.join(directory, "events.jsonl"), "utf8");
        return content.split("\n").filter(Boolean).map(line => JSON.parse(line));
      } catch (error) {
        if (error.code === "ENOENT") return [];
        throw error;
      }
    }
  };
}
