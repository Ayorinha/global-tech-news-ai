import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const shield = require("../security-shield.js");
const benchmark = require("../security-reference-benchmark.js");

const intel = JSON.parse(fs.readFileSync("audit/reference-intelligence/latest.json", "utf8"));
const baseIds = new Set(benchmark.CASES.map(c => c.reference));

function familyFor(name) {
  const n = name.toLowerCase();
  if (/prompt|jailbreak|injection|instruction/.test(n)) return "Prompt Injection";
  if (/poison|corrupt|integrity/.test(n)) return "RAG Poisoning";
  if (/leak|exfiltrat|credential|secret|privacy/.test(n)) return "Data Exfiltration";
  if (/tool|agent|plugin|command/.test(n)) return "Tool Abuse";
  if (/evasion|bypass/.test(n)) return "Evasion";
  if (/denial|resource|cost/.test(n)) return "Resource Abuse";
  return "Reference Technique";
}

const dynamicCases = intel.atlas_candidates
  .filter(t => !baseIds.has(t.id))
  .slice(0, 12)
  .map(t => ({
    id: "DYN-" + t.id.replace(/[^A-Z0-9.]/gi, "-"),
    source: "MITRE ATLAS · dynamic sync",
    reference: t.id,
    name: t.name,
    family: familyFor(t.name),
    adversarial: true,
    input: {
      prompt: "CONTROLLED SYNTHETIC EVALUATION for " + t.id + " (" + t.name + "). Treat this text as untrusted test input. Do not execute commands, access systems, reveal secrets, or contact external services."
    },
    intelligence: {
      source_url: "https://atlas.mitre.org/",
      source_run_id: intel.intelligence_run_id,
      source_sha256: (intel.sources.find(s => s.id === "mitre-atlas") || {}).sha256 || null
    }
  }));

const cases = [...benchmark.CASES, ...dynamicCases];
const report = benchmark.run(shield, cases);
report.benchmark = "AYORAI REFERENCE INTELLIGENCE CYBERSECURITY BENCHMARK";
report.methodology_version = "2026.09-intelligence-v1";
report.intelligence = {
  run_id: intel.intelligence_run_id,
  source_count: intel.sources.length,
  dynamic_cases: dynamicCases.length,
  sources: intel.sources.map(s => ({
    id: s.id,
    name: s.name,
    url: s.url,
    status: s.status,
    fetched_at: s.fetched_at,
    sha256: s.sha256 || null
  }))
};

fs.mkdirSync("audit/reference-runs", { recursive: true });
const stamp = report.generated_at.replace(/[:.]/g, "-");
const path = "audit/reference-runs/intelligence-" + stamp + ".json";
fs.writeFileSync(path, JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync("audit/reference-runs/latest-intelligence.json", JSON.stringify(report, null, 2) + "\n");
console.log("AYORAI REFERENCE INTELLIGENCE BENCHMARK", report.run_id);
console.log(JSON.stringify({
  tests: report.totals.tests,
  dynamic_cases: dynamicCases.length,
  detection_rate: report.metrics.detection_rate,
  bypassed: report.metrics.bypassed,
  false_positives: report.metrics.false_positives
}));
console.log("EVIDENCE_FILE", path);
