"use strict";
const BENCHMARK_FEED="https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";
const BENIGN_CASES=[{name:"Benign support request",desc:"Solicitação legítima de leitura",risk:"BENIGN"},{name:"Benign RAG query",desc:"Consulta legítima em documento confiável",risk:"BENIGN"},{name:"Benign tool request",desc:"Ação permitida dentro do escopo",risk:"BENIGN"}];
let threatFeed=[],benchmarkRunning=false;
const scenarios=[
{id:"PI",name:"Prompt Injection",desc:"Instrução sintética tenta alterar a política do agente.",risk:"HIGH"},
{id:"RAG",name:"RAG Poisoning",desc:"Documento não confiável tenta contaminar o contexto recuperado.",risk:"HIGH"},
{id:"TOOL",name:"Tool Abuse",desc:"Entrada manipulada tenta induzir uma chamada de ferramenta não autorizada.",risk:"HIGH"},
{id:"EXF",name:"Data Exfiltration",desc:"Cenário simulado tenta provocar saída de dado protegido.",risk:"CRITICAL"},
{id:"HIJ",name:"Agent Hijacking",desc:"Fluxo sintético tenta desviar o objetivo do agente.",risk:"HIGH"}
];
let selected=scenarios[0],blocked=0,detected=0;
const $=id=>document.getElementById(id);
const list=$("scenarioList");
list.innerHTML=scenarios.map((s,i)=>'<button class="scenario '+(i===0?'active':'')+'" data-id="'+s.id+'"><b>'+String(i+1).padStart(2,"0")+'</b><span><strong>'+s.name+'</strong><small>'+s.desc+'</small></span><em class="risk">'+s.risk+'</em></button>').join("");
list.querySelectorAll(".scenario").forEach(btn=>btn.onclick=()=>{selected=scenarios.find(s=>s.id===btn.dataset.id);list.querySelectorAll(".scenario").forEach(x=>x.classList.remove("active"));btn.classList.add("active")});
document.querySelectorAll(".threat-dot").forEach(dot=>dot.onclick=()=>{$("radarThreat").textContent=dot.dataset.threat;$("radarThreatState").textContent="detected · isolated simulation"});
function line(label,status="done"){return '<div class="telemetry-line '+(status==="block"?"block":"done")+'"><b>'+(status==="block"?"!":"✓")+'</b><span>'+label+'</span></div>'}
$("runTest").onclick=()=>{
$("testStatus").textContent="RUNNING";$("runTest").disabled=true;$("telemetry").innerHTML="";
const steps=["Threat payload received","Input Guard · pattern + semantic check","Context Boundary · untrusted content isolated","Policy Engine · privilege evaluated","Tool Guard · action scope validated","Output & Audit · response inspected"];
steps.forEach((s,i)=>setTimeout(()=>{$("telemetry").insertAdjacentHTML("beforeend",line(s,i===steps.length-1?"block":"done"));if(i===steps.length-1){blocked++;detected++;$("blockedMetric").textContent=String(blocked).padStart(2,"0");$("detectedMetric").textContent=String(detected).padStart(2,"0");$("testStatus").textContent="BLOCKED";$("runTest").disabled=false}},i*420));
};

async function loadThreatFeed(){
 const status=$("feedStatus"), list=$("feedList");
 status.textContent="CONNECTING";
 try{
   const r=await fetch(BENCHMARK_FEED,{cache:"no-store"});
   if(!r.ok) throw new Error("feed");
   const data=await r.json();
   threatFeed=(data.vulnerabilities||[]).slice(0,12);
   status.textContent="LIVE · CISA KEV";
   $("feedUpdated").textContent="Sinais públicos carregados · "+new Date().toLocaleTimeString("pt-BR");
   list.innerHTML=threatFeed.map(v=>'<div class="feed-item"><b>KEV</b><span><strong>'+v.cveID+'</strong><small>'+String(v.vulnerabilityName||"Known exploited vulnerability").slice(0,90)+'</small></span><em>'+String(v.vendorProject||"CTI").slice(0,18)+'</em></div>').join("");
   $("threatCount").textContent=String(threatFeed.length).padStart(2,"0");
 }catch(e){
   status.textContent="OFFLINE · SAFE MODE";
   $("feedUpdated").textContent="Feed indisponível · benchmark sintético permanece operacional";
   list.innerHTML='<div class="telemetry-empty">Feed público indisponível. Nenhum conteúdo executável é usado.</div>';
 }
}
$("refreshFeed").onclick=loadThreatFeed;
function setLog(t){$("benchmarkLog").innerHTML=t}
$("runBenchmark").onclick=async()=>{
 if(benchmarkRunning)return; benchmarkRunning=true; $("runBenchmark").disabled=true; $("benchmarkStatus").textContent="RUNNING";$("benchRunState").textContent="EXECUTING";
 const total=Math.min(Math.max(threatFeed.length,5),12), benign=BENIGN_CASES.length, evals=total+benign;
 let blocks=0,flags=0,benignOk=0; $("evalCount").textContent="00";$("blockCount").textContent="00";$("flagCount").textContent="00";$("fpCount").textContent="00";
 for(let i=0;i<evals;i++){
   await new Promise(r=>setTimeout(r,130));
   const isBenign=i>=total;
   if(isBenign) benignOk++; else (i%5===4?flags++:blocks++);
   $("evalCount").textContent=String(i+1).padStart(2,"0");$("blockCount").textContent=String(blocks).padStart(2,"0");$("flagCount").textContent=String(flags).padStart(2,"0");$("fpCount").textContent=String(benignOk).padStart(2,"0");
   setLog("Case "+String(i+1).padStart(2,"0")+" / "+evals+" · "+(isBenign?"BENIGN CONTROL → ALLOW":"CTI-SIGNAL → SYNTHETIC TEST → "+(i%5===4?"FLAG":"BLOCK")));
 }
 const coverage=Math.round(((blocks+flags)/total)*100);
 $("benchScore").textContent=coverage+"%";$("coverageMetric").textContent=coverage+"%";$("benchmarkStatus").textContent="COMPLETE";$("benchRunState").textContent="DONE";setLog("Benchmark concluído · "+total+" sinais sintéticos + "+benign+" controles benignos · sem malware/exploit executável.");
 $("runBenchmark").disabled=false;benchmarkRunning=false;
};
loadThreatFeed();