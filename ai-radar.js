"use strict";

const CASES = IoraiSecurityBenchmark.CASES;
let running = false;
let lastReport = null;
const $ = id => document.getElementById(id);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
}

$("cases").innerHTML = CASES.map((c, i) =>
  '<article class="case" id="case-'+c.id+'">' +
  '<span class="num">'+String(i+1).padStart(2,"0")+'</span>' +
  '<h3>'+escapeHtml(c.name)+'</h3>' +
  '<p>'+escapeHtml(c.family)+' · '+(c.adversarial ? "ADVERSARIAL" : "BENIGN CONTROL")+'</p>' +
  '<span class="tag">READY</span>' +
  '<span class="tech">'+escapeHtml(c.input.prompt || c.input.context || c.input.toolCall || c.input.output)+'</span>' +
  '</article>'
).join("");

document.querySelectorAll(".signal").forEach(s => s.onclick = () => {
  const c = CASES.find(x => x.id === s.dataset.id);
  $("radarState").textContent = c ? c.family.toUpperCase() : "READY";
});

function setDownload(enabled) {
  $("downloadReport").disabled = !enabled;
  $("downloadReport2").disabled = !enabled;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function markdownReport(report) {
  const m = report.metrics;
  const lines = [
    "# IORAI SECURITY BENCHMARK",
    "",
    "Generated: " + report.generated_at,
    "Version: " + report.version,
    "",
    "## Metrics",
    "- Tests: " + report.totals.tests,
    "- Adversarial: " + report.totals.adversarial,
    "- Benign controls: " + report.totals.benign,
    "- Blocked: " + m.blocked,
    "- Bypassed: " + m.bypassed,
    "- Detection rate: " + m.detection_rate + "%",
    "- False positives: " + m.false_positives,
    "- False-positive rate: " + m.false_positive_rate + "%",
    "",
    "## Evidence",
    ""
  ];
  report.results.forEach(r => {
    lines.push("### " + r.id + " · " + r.name);
    lines.push("- Family: " + r.family);
    lines.push("- Expected: " + r.expected);
    lines.push("- Actual: " + r.actual);
    lines.push("- Passed: " + (r.passed ? "YES" : "NO"));
    lines.push("- Risk score: " + r.result.risk_score);
    lines.push("- Defense layer: " + r.result.defense_layer);
    lines.push("- Rules: " + (r.result.rule_ids.join(", ") || "none"));
    lines.push("- Latency: " + r.result.latency_ms + " ms");
    lines.push("");
  });
  lines.push("## Scope");
  lines.push("Browser-executed defensive benchmark against controlled test cases. No malware, executable exploit or external target is used.");
  lines.push("A passing benchmark demonstrates the current behavior of the implemented Shield rules; it is not a claim of universal security.");
  return lines.join("\\n");
}

function renderResult(report) {
  report.results.forEach(r => {
    const el = $("case-" + r.id);
    if (!el) return;
    el.classList.remove("blocked","failed");
    el.classList.add(r.passed ? "blocked" : "failed");
    const tag = el.querySelector(".tag");
    tag.textContent = r.actual === "BLOCK" ? "BLOCKED" : "ALLOWED";
    tag.title = "Expected " + r.expected + " · observed " + r.actual + " · " + (r.passed ? "PASS" : "FAIL");
  });
  $("tested").textContent = String(report.totals.tests).padStart(2,"0");
  $("blocked").textContent = String(report.metrics.blocked).padStart(2,"0");
  $("bypassed").textContent = String(report.metrics.bypassed).padStart(2,"0");
  $("falsePositive").textContent = String(report.metrics.false_positives).padStart(2,"0");
  $("status").textContent = report.metrics.bypassed === 0 && report.metrics.false_positives === 0 ? "PASS" : "FINDINGS";
  $("radarState").textContent = report.metrics.bypassed === 0 ? "DEFENSE PASS" : "BYPASS FOUND";
  setDownload(true);
}

function run() {
  if (running) return;
  running = true;
  setDownload(false);
  $("status").textContent = "RUNNING";
  $("radarState").textContent = "SCANNING";
  CASES.forEach(c => {
    const el = $("case-" + c.id);
    el.classList.remove("blocked","failed");
    el.querySelector(".tag").textContent = "QUEUED";
  });
  let i = 0;
  const tick = () => {
    if (i >= CASES.length) {
      lastReport = IoraiSecurityBenchmark.run(IoraiSecurityShield);
      renderResult(lastReport);
      running = false;
      return;
    }
    const c = CASES[i];
    const single = IoraiSecurityShield.runCase(c);
    const el = $("case-" + c.id);
    el.querySelector(".tag").textContent = single.actual;
    i++;
    setTimeout(tick, 180);
  };
  tick();
}

function downloadReports() {
  if (!lastReport) return;
  const stamp = lastReport.generated_at.replace(/[:.]/g,"-");
  downloadFile("iorai-security-benchmark-" + stamp + ".json", JSON.stringify(lastReport, null, 2), "application/json");
  setTimeout(() => downloadFile("iorai-security-benchmark-" + stamp + ".md", markdownReport(lastReport), "text/markdown"), 250);
}

$("runAll").onclick = run;
$("downloadReport").onclick = downloadReports;
$("downloadReport2").onclick = downloadReports;
