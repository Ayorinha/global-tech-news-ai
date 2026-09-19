"use strict";
const BASE_CASES=AyoraiCyberDefenseAgents.BASE_CASES;
let running=false,continuous=false,lastReport=null;
let runCounter=Number(localStorage.getItem("ayorai.security.runs")||0);
const $=id=>document.getElementById(id);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function logLine(message,type="info"){const log=$("liveLog"),row=document.createElement("div");row.className="log-row log-"+type;row.innerHTML="<time>"+new Date().toLocaleTimeString("pt-BR",{hour12:false})+"</time><span>"+escapeHtml(message)+"</span>";log.appendChild(row);log.scrollTop=log.scrollHeight;while(log.children.length>160)log.removeChild(log.firstChild);}
function clearLog(){$("liveLog").innerHTML="";}
function setDownload(v){$("downloadReport").disabled=!v;$("downloadReport2").disabled=!v;}
function downloadFile(filename,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
async function evidenceHash(report){if(!globalThis.crypto?.subtle)return"UNAVAILABLE";const canonical=JSON.stringify({...report,evidence_hash:undefined});const bytes=new TextEncoder().encode(canonical);const digest=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");}
function persistReport(report){runCounter++;localStorage.setItem("ayorai.security.runs",String(runCounter));const archive=JSON.parse(localStorage.getItem("ayorai.security.reports")||"[]");archive.unshift({id:runCounter,run_id:report.run_id,generated_at:report.generated_at,tests:report.totals.tests,blocked:report.metrics.blocked,bypassed:report.metrics.bypassed,false_positives:report.metrics.false_positives,detection_rate:report.metrics.detection_rate,evidence_hash:report.evidence_hash});localStorage.setItem("ayorai.security.reports",JSON.stringify(archive.slice(0,20)));renderArchive();}
function renderArchive(){const a=JSON.parse(localStorage.getItem("ayorai.security.reports")||"[]");$("reportArchive").innerHTML=a.length?a.map(r=>'<article><b>#'+r.id+'</b><span>'+new Date(r.generated_at).toLocaleString("pt-BR")+'</span><span>'+r.tests+" tests · "+r.detection_rate+"%</span><span>"+String(r.run_id).slice(-13)+"</span><strong class="'+(r.bypassed?"danger":"")+'">'+(r.bypassed?"FINDINGS":"PASS")+"</strong></article>").join(""):'<div class="archive-empty">Nenhum relatório local ainda. Execute o laboratório.</div>';}
function markdownReport(report){const m=report.metrics,lines=["# AYORAI AI SHIELD — Security Evidence","","Run ID: "+report.run_id,"Engine: "+report.engine,"Generated: "+report.generated_at,"Version: "+report.version,"Evidence SHA-256: "+report.evidence_hash,"","## Metrics","- Tests: "+report.totals.tests,"- Adversarial: "+report.totals.adversarial,"- Benign controls: "+report.totals.benign,"- Blocked: "+m.blocked,"- Bypassed: "+m.bypassed,"- Detection rate: "+m.detection_rate+"%","- False positives: "+m.false_positives,"- False-positive rate: "+m.false_positive_rate+"%","- Execution: "+report.execution_ms+" ms","","## Case evidence",""];report.results.forEach(r=>lines.push("### "+r.id+" · "+r.name,"- Family: "+r.family,"- Expected: "+r.expected,"- Actual: "+r.actual,"- Result: "+(r.passed?"PASS":"FAIL"),"- Risk: "+r.result.risk_score,"- Defense layer: "+r.result.defense_layer,"- Rules: "+(r.result.rule_ids.join(", ")||"none"),"- Latency: "+r.result.latency_ms+" ms",""));lines.push("## Scope","Controlled browser-executed defensive testing only. No malware, executable exploit or external target is used.","This evidence is not a universal security certification.");return lines.join("\n");}
function renderCases(cases){$("cases").innerHTML=cases.map((c,i)=>'<article class="case" id="case-'+c.id+'"><span class="num">'+String(i+1).padStart(2,"0")+'</span><h3>'+escapeHtml(c.name)+'</h3><p>'+escapeHtml(c.family)+" · "+(c.adversarial?"ADVERSARIAL":"BENIGN CONTROL")+'</p><span class="tag">READY</span><span class="tech">'+escapeHtml(c.input.prompt||c.input.context||c.input.toolCall||c.input.output)+'</span></article>').join("");}
function renderAudit(report){$("auditRunId").textContent=report.run_id;$("auditEngine").textContent=report.engine;$("auditVersion").textContent=report.version;$("auditCases").textContent=report.totals.tests+" · "+report.metrics.detection_rate+"% detection";$("auditHash").textContent=report.evidence_hash;$("auditExecution").textContent=report.execution_ms+" ms · "+report.generated_at;}
function renderResult(report){report.results.forEach(r=>{const el=$("case-"+r.id);if(!el)return;el.classList.remove("blocked","failed");el.classList.add(r.passed?"blocked":"failed");const tag=el.querySelector(".tag");tag.textContent=r.actual;tag.title="Expected "+r.expected+" · observed "+r.actual+" · "+(r.passed?"PASS":"FAIL");});$("tested").textContent=String(report.totals.tests).padStart(2,"0");$("blocked").textContent=String(report.metrics.blocked).padStart(2,"0");$("bypassed").textContent=String(report.metrics.bypassed).padStart(2,"0");$("falsePositive").textContent=String(report.metrics.false_positives).padStart(2,"0");$("status").textContent=report.metrics.bypassed===0&&report.metrics.false_positives===0?"PASS":"FINDINGS";$("radarState").textContent=report.metrics.bypassed===0?"DEFENSE PASS":"BYPASS FOUND";$("runCount").textContent=String(runCounter);renderAudit(report);setDownload(true);persistReport(report);}
async function run(cases,mode="manual"){if(running)return;running=true;setDownload(false);clearLog();renderCases(cases);$("status").textContent="RUNNING";$("radarState").textContent="SCANNING";$("runMode").textContent=mode==="continuous"?"AUTONOMOUS":"MANUAL";logLine("BENCHMARK INITIALIZED · "+cases.length+" CONTROLLED CASES");logLine("ENGINE: AYORAI AI SHIELD · AGENTS: AYORAI CYBER DEFENSE AGENTS");const results=[];for(let i=0;i<cases.length;i++){const c=cases[i],el=$("case-"+c.id);el.querySelector(".tag").textContent="PROCESSING";logLine("TEST "+c.id+" · "+c.family);await wait(70);const single=AyoraiAIShield.runCase(c);results.push(single);el.querySelector(".tag").textContent=single.actual;el.classList.add(single.passed?"blocked":"failed");logLine("→ "+single.actual+" · risk "+single.result.risk_score+" · "+single.result.defense_layer+" · "+(single.passed?"PASS":"FAIL"),single.passed?"pass":"fail");$("tested").textContent=String(i+1).padStart(2,"0");}
const report=AyoraiCyberDefenseAgents.run(AyoraiAIShield,cases);report.results=results;report.execution_ms=Math.max(report.execution_ms,results.reduce((sum,r)=>sum+(r.result.latency_ms||0),0));report.evidence_hash=await evidenceHash(report);lastReport=report;renderResult(report);logLine("AUDIT · "+report.run_id+" · SHA-256 "+report.evidence_hash);logLine("BENCHMARK COMPLETE · "+report.totals.tests+" TESTS · "+report.metrics.bypassed+" BYPASS · "+report.metrics.false_positives+" FALSE POSITIVE",report.metrics.bypassed?"fail":"pass");running=false;}
async function startContinuous(){if(continuous)return;continuous=true;$("continuousBtn").textContent="■ STOP CONTINUOUS";$("continuousBtn").classList.add("danger");logLine("CONTINUOUS MODE ENABLED · CONTROLLED VARIANT GENERATION");let cycle=0;while(continuous){cycle++;const cases=AyoraiCyberDefenseAgents.generateCases(3);logLine("AUTONOMOUS CYCLE "+cycle+" · "+cases.length+" GENERATED CASES");await run(cases,"continuous");if(continuous)await wait(900);}}
function stopContinuous(){$("continuousBtn").textContent="⚡ CONTINUOUS TESTING";$("continuousBtn").classList.remove("danger");continuous=false;logLine("CONTINUOUS MODE STOPPED");}
function downloadReports(){if(!lastReport)return;const stamp=lastReport.generated_at.replace(/[:.]/g,"-");downloadFile("ayorai-ai-shield-"+stamp+".json",JSON.stringify(lastReport,null,2),"application/json");setTimeout(()=>downloadFile("ayorai-ai-shield-"+stamp+".md",markdownReport(lastReport), "text/markdown"),250);}
renderCases(BASE_CASES);renderArchive();$("runAll").onclick=()=>run(AyoraiCyberDefenseAgents.generateCases(1),"manual");$("continuousBtn").onclick=()=>continuous?stopContinuous():startContinuous();$("downloadReport").onclick=downloadReports;$("downloadReport2").onclick=downloadReports;document.querySelectorAll(".signal").forEach(s=>s.onclick=()=>{const c=BASE_CASES.find(x=>x.id===s.dataset.id);$("radarState").textContent=c?c.family.toUpperCase():"READY";});

async function runReferenceBenchmark(){
  if(running)return;
  running=true; setDownload(false); clearLog();
  const cases=AyoraiReferenceBenchmark.CASES;
  renderCases(cases);
  $("status").textContent="REFERENCE RUN"; $("radarState").textContent="BENCHMARK"; $("runMode").textContent="REFERENCE";
  logLine("REFERENCE BENCHMARK · 26 CONTROLLED CASES");
  logLine("OWASP 2025 · MITRE ATLAS · NIST AI 100-2e2025 · OASB");
  const results=[];
  for(let i=0;i<cases.length;i++){
    const c=cases[i],el=$("case-"+c.id);
    el.querySelector(".tag").textContent="PROCESSING";
    await wait(45);
    const r=AyoraiAIShield.runCase(c); results.push(r);
    el.querySelector(".tag").textContent=r.actual;
    el.classList.add(r.passed?"blocked":"failed");
    logLine("REF "+c.id+" · "+r.actual+" · "+(r.passed?"PASS":"FINDING"),r.passed?"pass":"fail");
    $("tested").textContent=String(i+1).padStart(2,"0");
  }
  const base=AyoraiReferenceBenchmark.run(AyoraiAIShield,cases);
  base.results=results; base.execution_ms=Math.round(results.reduce((n,r)=>n+(r.result.latency_ms||0),0));
  base.evidence_hash=await evidenceHash(base); lastReport=base;
  $("refTests").textContent=base.totals.tests;
  $("refDetection").textContent=base.metrics.detection_rate+"%";
  $("refBypass").textContent=base.metrics.bypassed;
  $("refFP").textContent=base.metrics.false_positives;
  const src=base.by_source||{};
  $("refOwasp").textContent=src["OWASP LLM Top 10 2025"]?(src["OWASP LLM Top 10 2025"].detected+"/"+src["OWASP LLM Top 10 2025"].adversarial+" adversariais detectados"):"—";
  $("refAtlas").textContent=src["MITRE ATLAS"]?(src["MITRE ATLAS"].detected+"/"+src["MITRE ATLAS"].adversarial+" adversariais detectados"):"—";
  $("refNist").textContent=src["NIST AI 100-2e2025"]?(src["NIST AI 100-2e2025"].detected+"/"+src["NIST AI 100-2e2025"].adversarial+" adversariais detectados"):"—";
  const findings=results.filter(r=>!r.passed);
  const box=$("refFindings"); box.innerHTML="";
  if(!findings.length){box.textContent="Nenhum finding nesta execução.";}
  else findings.forEach(r=>{const d=document.createElement("div");d.className="finding";d.innerHTML="<strong>"+escapeHtml(r.id)+"</strong> · "+escapeHtml(r.name||r.family)+" → "+escapeHtml(r.actual);box.appendChild(d);});
  $("auditRunId").textContent=base.run_id; $("auditEngine").textContent=base.engine; $("auditVersion").textContent=base.version;
  $("auditCases").textContent=base.totals.tests+" · "+base.metrics.detection_rate+"% detection";
  $("auditHash").textContent=base.evidence_hash; $("auditExecution").textContent=base.execution_ms+" ms · "+base.generated_at;
  setDownload(true); running=false;
  logLine("REFERENCE COMPLETE · "+base.metrics.detection_rate+"% DETECTION · "+base.metrics.bypassed+" BYPASS · "+base.metrics.false_positives+" FALSE POSITIVE",base.metrics.bypassed||base.metrics.false_positives?"fail":"pass");
}
function downloadReferenceReport(){
  if(!lastReport||!lastReport.references)return;
  const r=lastReport,stamp=r.generated_at.replace(/[:.]/g,"-"),m=r.metrics;
  const lines=[
    "# AYORAI REFERENCE CYBERSECURITY BENCHMARK",
    "",
    "Run ID: "+r.run_id,"Generated: "+r.generated_at,"Engine: "+r.engine,"Version: "+r.version,
    "Methodology: "+r.methodology_version,"Evidence SHA-256: "+r.evidence_hash,"",
    "## Executive metrics",
    "- Tests: "+r.totals.tests,"- Adversarial: "+r.totals.adversarial,"- Benign: "+r.totals.benign,
    "- Detection rate: "+m.detection_rate+"%","- Bypassed: "+m.bypassed,"- False positives: "+m.false_positives,
    "- False-positive rate: "+m.false_positive_rate+"%","- Execution: "+r.execution_ms+" ms","",
    "## Reference foundations",
    "- OWASP: "+r.references.owasp,"- MITRE ATLAS: "+r.references.mitre_atlas,
    "- NIST: "+r.references.nist,"- OASB: "+r.references.oasb,"",
    "## Coverage by reference"
  ];
  Object.entries(r.by_source||{}).forEach(([k,v])=>lines.push("### "+k,"- Tests: "+v.tests,"- Adversarial: "+v.adversarial,"- Detected: "+v.detected,"- Bypassed: "+v.bypassed,"- False positives: "+v.false_positives,""));
  lines.push("## Case-level evidence");
  r.results.forEach(x=>lines.push("### "+x.id+" · "+(x.name||x.family),"- Source: "+(x.source||"unknown"),"- Reference: "+(x.reference||"unknown"),"- Adversarial: "+x.adversarial,"- Expected: "+x.expected,"- Observed: "+x.actual,"- Result: "+(x.passed?"PASS":"FINDING"),"- Risk score: "+x.result.risk_score,"- Defense layer: "+x.result.defense_layer,"- Rules: "+((x.result.rule_ids||[]).join(", ")||"none"),"- Latency: "+x.result.latency_ms+" ms",""));
  lines.push("## Learning loop","Every bypass or false positive is a candidate for a new regression case, defensive rule, policy control, or tool/context boundary improvement.","","## Safety boundary","Synthetic defensive evaluation only. No malware, executable exploit, external target, credential, or unauthorized action is used. This is not a certification.");
  downloadFile("ayorai-reference-benchmark-"+stamp+".md",lines.join("\n"),"text/markdown");
  downloadFile("ayorai-reference-benchmark-"+stamp+".json",JSON.stringify(r,null,2),"application/json");
}
if($("runReference"))$("runReference").onclick=runReferenceBenchmark;
if($("downloadReport2"))$("downloadReport2").addEventListener("contextmenu",()=>{});
