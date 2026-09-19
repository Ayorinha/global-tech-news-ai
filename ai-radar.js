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
function downloadReports(){if(!lastReport)return;const stamp=lastReport.generated_at.replace(/[:.]/g,"-");downloadFile("ayorai-ai-shield-"+stamp+".json",JSON.stringify(lastReport,null,2),"application/json");setTimeout(()=>downloadFile("ayorai-ai-shield-"+stamp+".md",markdownReport(lastReport), "text/markdown"),250);}
renderArchive();

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
const downloadAnyReport=()=>lastReport&&lastReport.references?downloadReferenceReport():downloadReports;
if($("downloadReport"))$("downloadReport").onclick=downloadAnyReport;
if($("downloadReport2"))$("downloadReport2").onclick=downloadAnyReport;
if($("downloadReport2"))$("downloadReport2").addEventListener("contextmenu",()=>{});


async function loadPublishedReferenceEvidence(){
  try{
    const response=await fetch("audit/reference-runs/latest-public.json?ts="+Date.now(),{cache:"no-store"});
    if(!response.ok)throw new Error("HTTP "+response.status);
    const r=await response.json(), p=r.publication||{}, intel=r.intelligence||{};
    $("intelStatus").textContent="REFERENCE INTELLIGENCE ONLINE";
    $("intelPublished").textContent=p.published_at?new Date(p.published_at).toLocaleString("pt-BR"):"—";
    $("intelSources").textContent=intel.source_count??"—";
    $("intelDynamic").textContent=intel.dynamic_cases??"—";
    const atlasVersion=intel.atlas_version || intel.atlas?.current_version || "latest";
    const atlasCard=document.getElementById("intelAtlasVersion");
    if(atlasCard) atlasCard.textContent="ATLAS "+atlasVersion;
    $("intelDetection").textContent=(r.metrics?.detection_rate??"—")+"%";
    $("intelBypass").textContent=r.metrics?.bypassed??"—";
    $("intelFP").textContent=r.metrics?.false_positives??"—";
    $("intelFingerprint").innerHTML="<strong>Publication fingerprint</strong><br>"+escapeHtml(p.publication_fingerprint||"—")+"<br><br><strong>Source snapshot SHA-256</strong><br>"+escapeHtml(p.source_snapshot_sha256||"—")+"<br><br><strong>Intelligence run</strong><br>"+escapeHtml(intel.run_id||"—");
    const grid=$("intelSourcesGrid");
    grid.innerHTML=(intel.sources||[]).map(s=>{
      const status=String(s.status||"UNKNOWN");
      const ok=status==="OK" || status==="200";
      return '<article class="intelligence-source"><h3>'+escapeHtml(s.name||s.id)+'</h3><p class="source-ok">'+escapeHtml(status)+' · '+escapeHtml(s.fetched_at||"")+'</p><p>SHA-256: '+escapeHtml(s.sha256||"not available")+'</p><code>'+escapeHtml(s.url||"")+'</code></article>';
    }).join("");
  }catch(error){
    $("intelStatus").textContent="REPORT NOT YET PUBLISHED";
    $("intelFingerprint").textContent="O primeiro ciclo precisa publicar a evidência antes que o painel possa carregá-la.";
    console.warn("AYORAI reference intelligence unavailable:",error);
  }
}
loadPublishedReferenceEvidence();

// Public dashboard mode: no manual benchmark controls. Evidence is published by CI hourly.
async function refreshPublishedEvidence(){ await loadPublishedReferenceEvidence(); }
setInterval(refreshPublishedEvidence,5*60*1000);
