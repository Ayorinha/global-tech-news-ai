"use strict";
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
