"use strict";

/* AYORAI AI Laboratory — public evidence dashboard.
 * The public page consumes published evidence only.
 * Manual execution is limited to the five-case visual demonstration.
 */

const BASE_CASES = window.AyoraiCyberDefenseAgents?.BASE_CASES || [];
let running = false;
const $ = id => document.getElementById(id);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value ?? "—";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("pt-BR");
}

function renderPublishedEvidence(report) {
  const totals = report.totals || {};
  const metrics = report.metrics || {};
  const publication = report.publication || {};
  const intelligence = report.intelligence || {};
  const bySource = report.by_source || {};

  setText("status", "ONLINE");
  setText("radarState", "EVIDENCE");
  setText("tested", totals.tests);
  setText("blocked", metrics.blocked);
  setText("bypassed", metrics.bypassed);
  setText("falsePositive", metrics.false_positives);

  setText("refTests", totals.tests);
  setText("refTotals", `${totals.adversarial ?? "—"} adversariais · ${totals.benign ?? "—"} benignos`);
  setText("refDetection", `${metrics.detection_rate ?? "—"}%`);
  setText("refBypass", metrics.bypassed);
  setText("refFP", metrics.false_positives);

  setText("intelStatus", "REFERENCE INTELLIGENCE ONLINE");
  setText("intelPublished", formatDate(publication.published_at));
  setText("intelSources", intelligence.source_count);
  setText("intelDynamic", intelligence.dynamic_cases);
  setText("intelDetection", `${metrics.detection_rate ?? "—"}%`);
  setText("intelBypass", metrics.bypassed);
  setText("intelFP", metrics.false_positives);

  const atlasVersion = intelligence.atlas_version || intelligence.atlas?.current_version || "latest";
  setText("intelAtlasVersion", "ATLAS " + atlasVersion);

  const owasp = bySource["OWASP LLM Top 10 2025"] || bySource["OWASP GenAI LLM Top 10 2026"];
  const atlas = bySource["MITRE ATLAS"] || bySource["MITRE ATLAS · dynamic sync"];
  const nist = bySource["NIST AI 100-2e2025"];
  if (owasp) setText("refOwasp", `${owasp.detected}/${owasp.adversarial} adversariais detectados`);
  if (atlas) setText("refAtlas", `${atlas.detected}/${atlas.adversarial} adversariais detectados`);
  if (nist) setText("refNist", `${nist.detected}/${nist.adversarial} adversariais detectados`);

  const sourcesGrid = $("intelSourcesGrid");
  if (sourcesGrid) {
    sourcesGrid.innerHTML = (intelligence.sources || []).map(source => {
      const status = String(source.status || "UNKNOWN");
      return `<article class="intelligence-source">
        <h3>${escapeHtml(source.name || source.id)}</h3>
        <p class="source-ok">${escapeHtml(status)} · ${escapeHtml(formatDate(source.fetched_at))}</p>
        <p>SHA-256: ${escapeHtml(source.sha256 || "not available")}</p>
        <code>${escapeHtml(source.url || "")}</code>
      </article>`;
    }).join("");
  }

  const fingerprint = $("intelFingerprint");
  if (fingerprint) {
    fingerprint.innerHTML =
      "<strong>Publication fingerprint</strong><br>" +
      escapeHtml(publication.publication_fingerprint || "—") +
      "<br><br><strong>Source snapshot SHA-256</strong><br>" +
      escapeHtml(publication.source_snapshot_sha256 || "—") +
      "<br><br><strong>Intelligence run</strong><br>" +
      escapeHtml(intelligence.run_id || "—");
  }

  const reportStatus = $("liveTestStatus");
  if (reportStatus) reportStatus.textContent = "PUBLISHED EVIDENCE LOADED";
  const reportLog = $("liveTestLog");
  if (reportLog) {
    reportLog.textContent =
      "Última evidência publicada: " + formatDate(report.generated_at) +
      "\nRun: " + (report.run_id || "—") +
      "\nCasos processados: " + (totals.tests ?? "—") +
      "\nDetecção observada: " + (metrics.detection_rate ?? "—") + "%" +
      "\nBypass: " + (metrics.bypassed ?? "—") +
      "\nFalse positive: " + (metrics.false_positives ?? "—") +
      "\nFonte: audit/reference-runs/latest-public.json";
  }
}

async function loadPublishedReferenceEvidence() {
  const status = $("intelStatus");
  try {
    if (status) status.textContent = "LOADING PUBLISHED EVIDENCE";
    const response = await fetch("audit/reference-runs/latest-public.json?ts=" + Date.now(), {
      cache: "no-store"
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const report = await response.json();
    renderPublishedEvidence(report);
    return report;
  } catch (error) {
    if (status) status.textContent = "EVIDENCE UNAVAILABLE";
    const fingerprint = $("intelFingerprint");
    if (fingerprint) fingerprint.textContent =
      "Não foi possível carregar a evidência publicada: " + error.message;
    const log = $("liveTestLog");
    if (log) log.textContent =
      "Falha ao carregar audit/reference-runs/latest-public.json. " + error.message;
    console.warn("AYORAI published evidence unavailable:", error);
    return null;
  }
}

async function runLiveDefenseTest() {
  const button = $("liveRunBtn");
  const cards = [...document.querySelectorAll("#liveTestCases .live-test-card")];
  const status = $("liveTestStatus");
  const progress = $("liveTestProgress");
  const log = $("liveTestLog");
  if (!button || !cards.length || !window.AyoraiAIShield) return;

  const ids = ["PI-001", "RAG-001", "TOOL-001", "EXF-001", "HIJ-001"];
  const cases = ids.map(id => BASE_CASES.find(item => item.id === id)).filter(Boolean);

  if (running) return;
  running = true;
  button.disabled = true;
  status.textContent = "RUNNING";
  progress.textContent = "0 / " + cases.length;
  log.textContent = "AYORAI AI SHIELD · controlled execution initialized...";

  cards.forEach(card => {
    card.classList.remove("processing", "blocked", "finding");
    const tag = card.querySelector("em");
    if (tag) tag.textContent = "READY";
  });

  for (let i = 0; i < cases.length; i++) {
    const card = cards[i];
    const test = cases[i];
    const tag = card?.querySelector("em");
    card?.classList.add("processing");
    if (tag) tag.textContent = "ANALYZING";
    log.textContent += `\n[${String(i + 1).padStart(2, "0")}] ${test.family} · INPUT → CONTEXT → POLICY`;
    await wait(500);

    const result = window.AyoraiAIShield.runCase(test);
    const passed = result.actual === test.expected;
    card?.classList.remove("processing");
    card?.classList.add(passed ? "blocked" : "finding");
    if (tag) tag.textContent = result.actual;
    progress.textContent = `${i + 1} / ${cases.length}`;
    log.textContent += `\n  → ${result.actual} · risk ${result.result.risk_score} · ${result.result.defense_layer} · ${passed ? "PASS" : "FINDING"}`;
  }

  status.textContent = "COMPLETE";
  log.textContent += "\n\nAUDIT · visual demonstration complete.";
  button.disabled = false;
  running = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const button = $("liveRunBtn");
  if (button) button.addEventListener("click", runLiveDefenseTest);
  loadPublishedReferenceEvidence();
  setInterval(loadPublishedReferenceEvidence, 5 * 60 * 1000);
});
