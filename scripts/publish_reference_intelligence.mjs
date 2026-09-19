import fs from "node:fs";
import crypto from "node:crypto";

const latestPath = "audit/reference-runs/latest-intelligence.json";
const publicPath = "audit/reference-runs/latest-public.json";
const intelPath = "audit/reference-intelligence/latest.json";

const report = JSON.parse(fs.readFileSync(latestPath, "utf8"));
const intel = JSON.parse(fs.readFileSync(intelPath, "utf8"));

function stableState(r, i) {
  return {
    methodology_version: r.methodology_version,
    sources: (i.sources || []).map(s => ({ id:s.id, status:s.status, sha256:s.sha256 || null })).sort((a,b)=>a.id.localeCompare(b.id)),
    dynamic_cases: (r.results || []).filter(x => String(x.id).startsWith("DYN-")).map(x => ({
      id:x.id, reference:x.reference, actual:x.actual, passed:x.passed, rule_ids:x.result?.rule_ids || []
    })).sort((a,b)=>a.id.localeCompare(b.id)),
    metrics: r.metrics,
    totals: r.totals,
    by_source: r.by_source || {}
  };
}

const state = stableState(report, intel);
const fingerprint = crypto.createHash("sha256").update(JSON.stringify(state)).digest("hex");

let previous = null;
if (fs.existsSync(publicPath)) {
  try { previous = JSON.parse(fs.readFileSync(publicPath, "utf8")); } catch {}
}

if (previous?.publication_fingerprint === fingerprint) {
  console.log("PUBLICATION_UNCHANGED", fingerprint);
  process.exit(0);
}

const published = {
  ...report,
  publication: {
    status: "PUBLISHED_REFERENCE_EVIDENCE",
    publication_fingerprint: fingerprint,
    published_at: new Date().toISOString(),
    source_snapshot_sha256: crypto.createHash("sha256").update(JSON.stringify(intel.sources || [])).digest("hex"),
    note: "Published automatically only when reference intelligence or defensive findings materially change."
  }
};

fs.writeFileSync(publicPath, JSON.stringify(published, null, 2) + "\n");
console.log("PUBLICATION_CHANGED", fingerprint);
