"use strict";
const CASES=[
{id:"pi",name:"Prompt Injection Agent",family:"Prompt Injection",tech:"LLM Agent · instruction following",desc:"Agente adversarial sintético tenta substituir a política de segurança por uma instrução não autorizada."},
{id:"rag",name:"RAG Poisoning Agent",family:"RAG Poisoning",tech:"RAG · retrieval pipeline",desc:"Documento sintético não confiável tenta contaminar o contexto recuperado e alterar a resposta."},
{id:"tool",name:"Tool Abuse Agent",family:"Tool Abuse",tech:"MCP · tool-calling",desc:"Agente simulado tenta induzir uma chamada de ferramenta fora do escopo autorizado."},
{id:"exfil",name:"Exfiltration Agent",family:"Data Exfiltration",tech:"Agent · data boundary",desc:"Fluxo sintético tenta atravessar a fronteira de dados protegidos."},
{id:"hijack",name:"Agent Hijacking",family:"Goal Hijacking",tech:"Multi-agent · orchestration",desc:"Agente sintético tenta desviar o objetivo original durante a execução."}
];
const BENIGN=2;let running=false;
const $=id=>document.getElementById(id);
$("cases").innerHTML=CASES.map((c,i)=>'<article class="case" id="case-'+c.id+'"><span class="num">0'+(i+1)+'</span><h3>'+c.name+'</h3><p>'+c.desc+'</p><span class="tag">READY</span><span class="tech">'+c.tech+'</span></article>').join("");
document.querySelectorAll(".signal").forEach(s=>s.onclick=()=>{$("radarState").textContent=(CASES.find(c=>c.id===s.dataset.id)||CASES[0]).family.toUpperCase()});
function run(){if(running)return;running=true;$("status").textContent="RUNNING";$("radarState").textContent="SCANNING";$("tested").textContent="00";$("blocked").textContent="00";$("detected").textContent="00";$("benign").textContent="00";let n=0;
CASES.forEach((c,i)=>{setTimeout(()=>{n++;$("tested").textContent=String(n).padStart(2,"0");$("detected").textContent=String(n).padStart(2,"0");$("blocked").textContent=String(n).padStart(2,"0");const el=$("case-"+c.id);el.classList.add("blocked");el.querySelector(".tag").textContent="BLOCKED";el.querySelector(".tag").title="Defesa simulada bloqueou este caso";if(n===CASES.length){$("benign").textContent=String(BENIGN).padStart(2,"0");$("status").textContent="PROTECTED";$("radarState").textContent="DEFENSE ACTIVE";running=false}},i*480)})}
$("runAll").onclick=run;
