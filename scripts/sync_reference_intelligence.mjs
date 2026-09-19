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
  let buffer = Buffer.from(await response.arrayBuffer());
  let text = buffer.toString("utf8").trim();
  let resolvedUrl = source.url;

  if (source.id === "mitre-atlas" && /^ATLAS-\d{4}\.\d+\.yaml$/.test(text)) {
    resolvedUrl = source.url.replace(/ATLAS-latest\.yaml$/, text);
    const resolved = await fetch(resolvedUrl, {
      headers: { "User-Agent": "AYORAI-Reference-Intelligence/1.0" }
    });
    if (!resolved.ok) throw new Error(source.id + " resolved HTTP " + resolved.status);
    buffer = Buffer.from(await resolved.arrayBuffer());
    text = buffer.toString("utf8");
  }

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  return {
    ...source,
    resolved_url: resolvedUrl,
    fetched_at: new Date().toISOString(),
    status: "OK",
    http_status: response.status,
    bytes: buffer.length,
    sha256,
    latency_ms: Date.now() - started,
    content_preview: text.replace(/\s+/g, " ").slice(0, 500),
    raw_text: text
  };
}

function extractAtlasCandidates(raw) {
  const source = String(raw || "");
  const section = source.split(/^techniques:\s*$/m)[1]?.split(/^mitigations:\s*$/m)[0] || "";
  const blocks = section.split(/\n(?=  AML\.T\d)/);
  const seen = new Set();
  const keywords = /(prompt|jailbreak|poison|leak|exfiltrat|evasion|agent|tool|model|data|supply|injection|extraction|denial|resource|service|scan|trigger|bias|clickbait|runtime|infrastructure)/i;
  const candidates = [];
  for (const block of blocks) {
    const id = block.match(/^  (AML\.T\d+(?:\.\d+)?):/m)?.[1];
    const name = block.match(/^\s+name:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
    const descriptionMatch = block.match(/^\s+description:\s*([\s\S]*?)(?=^  AML\.T|^\s{2}(?:AML\.|mitigations:|case-studies:)|$)/m);
    const description = descriptionMatch?.[1] || "";
    if (!id || !name || seen.has(id)) continue;
    if (keywords.test(name + " " + description)) {
      seen.add(id);
      candidates.push({id,name,description:description.replace(/\s+/g," ").trim()});
    }
  }
  return candidates.slice(0, 24);
}

const fetched = [];
let atlasCandidates = [];
for (const source of sources) {
  try {
    const item = await fetchSource(source);
    fetched.push(item);
    if (source.id === "mitre-atlas") {
      atlasCandidates = extractAtlasCandidates(item.raw_text);
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
  sources: fetched.map(({content_preview, raw_text, ...x}) => x),
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
