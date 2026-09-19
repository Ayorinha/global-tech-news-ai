import fs from "node:fs";
import crypto from "node:crypto";

const sources = JSON.parse(fs.readFileSync("reference-intelligence/sources.json", "utf8")).sources;
const outDir = "audit/reference-intelligence";
fs.mkdirSync(outDir, { recursive: true });

async function fetchSource(source) {
  const started = Date.now();
  const response = await fetch(source.url, {
    headers: { "User-Agent": "AYORAI-Reference-Intelligence/1.0" }
  });
  if (!response.ok) throw new Error(source.id + " HTTP " + response.status);
  const buffer = Buffer.from(await response.arrayBuffer());
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const text = buffer.toString("utf8");
  return {
    ...source,
    fetched_at: new Date().toISOString(),
    status: "OK",
    http_status: response.status,
    bytes: buffer.length,
    sha256,
    latency_ms: Date.now() - started,
    content_preview: text.replace(/\\s+/g, " ").slice(0, 500)
  };
}

function extractAtlasCandidates(raw) {
  let data;
  try { data = JSON.parse(raw); } catch { return []; }
  const objects = Array.isArray(data.objects) ? data.objects : [];
  const seen = new Set();
  const keywords = /(prompt|jailbreak|poison|leak|exfiltrat|evasion|agent|tool|model|data|supply|injection|extraction|denial|resource)/i;
  return objects
    .filter(o => o && o.type === "attack-pattern")
    .map(o => {
      const ref = (o.external_references || []).find(r => r.source_name === "mitre-atlas" && /^AML\\.T\\d+/.test(r.external_id || ""));
      return ref ? { id: ref.external_id, name: o.name || ref.external_id, description: o.description || "" } : null;
    })
    .filter(Boolean)
    .filter(x => keywords.test(x.name + " " + x.description))
    .filter(x => !seen.has(x.id) && (seen.add(x.id), true))
    .slice(0, 24);
}

const fetched = [];
let atlasCandidates = [];
for (const source of sources) {
  try {
    const item = await fetchSource(source);
    fetched.push(item);
    if (source.id === "mitre-atlas") {
      const raw = await (await fetch(source.url)).text();
      atlasCandidates = extractAtlasCandidates(raw);
    }
  } catch (error) {
    fetched.push({
      ...source,
      fetched_at: new Date().toISOString(),
      status: "ERROR",
      error: String(error)
    });
  }
}

const manifest = {
  intelligence_run_id: "AYORAI-INTEL-" + new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 17),
  generated_at: new Date().toISOString(),
  interval_minutes: 5,
  safety_boundary: "Reference data only; no malware, exploit payloads, credentials, or external targets are executed.",
  sources: fetched.map(({content_preview, ...x}) => x),
  atlas_candidates: atlasCandidates
};

fs.writeFileSync(outDir + "/latest.json", JSON.stringify(manifest, null, 2) + "\n");
fs.writeFileSync(outDir + "/" + manifest.intelligence_run_id + ".json", JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({
  run_id: manifest.intelligence_run_id,
  sources_ok: fetched.filter(x => x.status === "OK").length,
  sources_error: fetched.filter(x => x.status === "ERROR").length,
  atlas_candidates: atlasCandidates.length
}));
