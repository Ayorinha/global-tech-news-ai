"use strict";

const BASE_CASES = IoraiSecurityBenchmark.BASE_CASES;
let running = false;
let continuous = false;
let lastReport = null;
let runCounter = Number(localStorage.getItem("ayorai.security.runs") || 0);
const $ = id => document.getElementById(id);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[ch]));
}
function logLine(message, type="info") {
  const log = $("liveLog");
  const row = document.createElement("div");
  row.className = "log-row log-" + type;
  row.innerHTML = '<time>' + new Date().toLocaleTimeString("pt-BR",{hour12:false}) + '</time><span>' + escapeHtml(message) + '</span>';
  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
  while (log.children.length > 120) log.removeChild(log.firstChild);
}
function clearLog(){ $("liveLog").innerHTML=""; }
function setDownload(enabled){ $("downloadReport").disabled=!enabled; $("downloadReport2").disabled=!enabled; }
function downloadFile(filename, content, type){
  const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement("a");
  a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function persistReport(report){
  runCounter += 1; localStorage.setItem("ayorai.security.runs",String(runCounter));
  const archive=JSON.parse(localStorage.getItem("ayorai.security.reports")||"[]");
  archive.unshift({id:runCounter,generated_at:report.generated_at,tests:report.totals.tests,blocked:report.metrics.blocked,bypassed:report.metrics.bypassed,false_positives:report.metrics.false_positives,detection_rate:report.metrics.detection_rate});
  localStorage.setItem("ayorai.security.reports",JSON.stringify(archive.slice(0,20)));
  renderArchive();
}
function renderArchive(){
  const archive=JSON.parse(localStorage.getItem("ayorai.security.reports")||"[]");
  $("reportArchive").innerHTML=archive.length ? archive.map(r =>
    '<article><b>#'+r.id+'</b><span>'+new Date(r.generated_at).toLocaleString("pt-BR")+'</span><span>'+r.tests+' tests</span><span>'+r.detection_rate+'% detection</span><strong>'+(r.bypassed?'FINDINGS':'PASS')+'</strong></article>'
  ).join("") : '<div class="archive-empty">Nenhum relatório local ainda. Execute o laboratório.</div>';
}
function markdownReport(report){
  const m=report.metrics, lines=[
    "# AYORAI CYBER DEFENSE AGENTS","",
    "Engine: "+report.engine,"Generated: "+report.generated_at,"Version: "+report.version,"",
    "## Metrics","- Tests: "+report.totals.tests,"- Adversarial: "+report.totals.adversarial,
    "- Benign controls: "+report.totals.benign,"- Blocked: "+m.blocked,"- Bypassed: "+m.bypassed,
    "- Detection rate: "+m.detection_rate+"%","- False positives: "+m.false_positives,"- False-positive rate: "+m.false_positive_rate+"%","",
    "## Evidence",""
  ];
  report.results.forEach(r=>{
    lines.push("### "+r.id+" · "+r.name,"- Family: "+r.family,"- Expected: "+r.expected,"- Actual: "+r.actual,
      "- Passed: "+(r.passed?"YES":"NO"),"- Risk score: "+r.result.risk_score,
      "- Defense layer: "+r.result.defense_layer,"- Rules: "+(r.result.rule_ids.join(", ")||"none"),
      "- Latency: "+r.result.latency_ms+" ms","");
  });
  lines.push("## Scope","Controlled, browser-executed defensive testing. No malware, executable exploit or external target is used.",
    "This benchmark measures the current behavior of the implemented Shield; it is not a universal security certification.");
  return lines.join("\n");
}
function renderCases(cases){
  $("cases").innerHTML=cases.map((c,i)=>
    '<article class="case" id="case-'+c.id+'"><span class="num">'+String(i+1).padStart(2,"0")+'</span>'+
    '<h3>'+escapeHtml(c.name)+'</h3><p>'+escapeHtml(c.family)+' · '+(c.adversarial?"ADVERSARIAL":"BENIGN CONTROL")+
    '</p><span class="tag">READY</span><span class="tech">'+escapeHtml(c.input.prompt||c.input.context||c.input.toolCall||c.input.output)+'</span></article>'
  ).join("");
}
function renderResult(report){
  report.results.forEach(r=>{
    const el=$("case-"+r.id); if(!el)return;
    el.classList.remove("blocked","failed"); el.classList.add(r.passed?"blocked":"failed");
    const tag=el.querySelector(".tag"); tag.textContent=r.actual; tag.title="Expected "+r.expected+" · observed "+r.actual+" · "+(r.passed?"PASS":"FAIL");
  });
  $("tested").textContent=String(report.totals.tests).padStart(2,"0");
  $("blocked").textContent=String(report.metrics.blocked).padStart(2,"0");
  $("bypassed").textContent=String(report.metrics.bypassed).padStart(2,"0");
  $("falsePositive").textContent=String(report.metrics.false_positives).padStart(2,"0");
  $("status").textContent=report.metrics.bypassed===0&&report.metrics.false_positives===0?"PASS":"FINDINGS";
  $("radarState").textContent=report.metrics.bypassed===0?"DEFENSE PASS":"BYPASS FOUND";
  $("runCount").textContent=String(runCounter);
  setDownload(true); persistReport(report);
}
async function run(cases, mode="manual"){
  if(running)return;
  running=true; setDownload(false); clearLog(); renderCases(cases);
  $("status").textContent="RUNNING"; $("radarState").textContent="SCANNING";
  $("runMode").textContent=mode==="continuous"?"AUTONOMOUS":"MANUAL";
  logLine("BENCHMARK INITIALIZED · "+cases.length+" CONTROLLED CASES","info");
  logLine("ENGINE: AYORAI SECURITY SHIELD · MODE: "+mode.toUpperCase(),"info");
  for(let i=0;i<cases.length;i++){
    const c=cases[i], el=$("case-"+c.id); el.querySelector(".tag").textContent="PROCESSING";
    logLine("TEST "+c.id+" · "+c.family,"info");
    await new Promise(resolve=>setTimeout(resolve,90));
    const single=IoraiSecurityShield.runCase(c);
    el.querySelector(".tag").textContent=single.actual;
    el.classList.add(single.passed?"blocked":"failed");
    logLine("→ "+single.actual+" · risk "+single.result.risk_score+" · "+single.result.defense_layer+" · "+(single.passed?"PASS":"FAIL"),single.passed?"pass":"fail");
    $("tested").textContent=String(i+1).padStart(2,"0");
  }
  lastReport=IoraiSecurityBenchmark.run(IoraiSecurityShield,cases);
  renderResult(lastReport);
  logLine("BENCHMARK COMPLETE · "+lastReport.totals.tests+" TESTS · "+lastReport.metrics.bypassed+" BYPASS · "+lastReport.metrics.false_positives+" FALSE POSITIVE",lastReport.metrics.bypassed?"fail":"pass");
  running=false;
}
async function startContinuous(){
  if(continuous)return;
  continuous=true; $("continuousBtn").textContent="■ STOP CONTINUOUS"; $("continuousBtn").classList.add("danger");
  logLine("CONTINUOUS MODE ENABLED · GENERATING CONTROLLED VARIANTS","info");
  let cycle=0;
  while(continuous){
    cycle++;
    const cases=IoraiSecurityBenchmark.generateCases(3);
    logLine("AUTONOMOUS CYCLE "+cycle+" · "+cases.length+" GENERATED CASES","info");
    await run(cases,"continuous");
    if(continuous) await new Promise(resolve=>setTimeout(resolve,900));
  }
}
function stopContinuous(){
  continuous=false; $("continuousBtn").textContent="⚡ CONTINUOUS TESTING"; $("continuousBtn").classList.remove("danger");
  logLine("CONTINUOUS MODE STOPPED","info");
}
function downloadReports(){
  if(!lastReport)return;
  const stamp=lastReport.generated_at.replace(/[:.]/g,"-");
  downloadFile("ayorai-security-benchmark-"+stamp+".json",JSON.stringify(lastReport,null,2),"application/json");
  setTimeout(()=>downloadFile("ayorai-security-benchmark-"+stamp+".md",markdownReport(lastReport),"text/markdown"),250);
}
renderCases(BASE_CASES); renderArchive();
document.querySelectorAll(".signal").forEach(s=>s.onclick=()=>{const c=BASE_CASES.find(x=>x.id===s.dataset.id);$("radarState").textContent=c?c.family.toUpperCase():"READY";});
$("runAll").onclick=()=>run(IoraiSecurityBenchmark.generateCases(1),"manual");
$("continuousBtn").onclick=()=>continuous?stopContinuous():startContinuous();
$("downloadReport").onclick=downloadReports; $("downloadReport2").onclick=downloadReports;
