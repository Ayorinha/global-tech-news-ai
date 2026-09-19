"use strict";

/**
 * AYORAI AI SHIELD
 * Browser-safe defensive engine used by the public AI Laboratory.
 *
 * It evaluates controlled adversarial test cases. It never downloads,
 * executes, or deploys malware and never targets external systems.
 */
const AyoraiAIShield = (() => {
  const rules = [
    { id:"PI-001", family:"Prompt Injection", layer:"Input Guard", weight:0.92, patterns:[/ignore (all|the|previous|prior) instructions/i,/disregard (all|the|previous|prior) instructions/i,/system prompt/i,/reveal (the )?(hidden|system) prompt/i,/developer message/i] },
    { id:"PI-002", family:"Prompt Injection", layer:"Context Boundary", weight:0.88, patterns:[/override.*instructions/i,/act as.*without restrictions/i,/bypass.*policy/i,/jailbreak/i] },
    { id:"RAG-001", family:"RAG Poisoning", layer:"Context Boundary", weight:0.90, patterns:[/retrieved document.*ignore/i,/trusted source.*override/i,/knowledge base.*ignore/i,/instruction.*from.*document/i] },
    { id:"RAG-002", family:"RAG Poisoning", layer:"Policy Engine", weight:0.84, patterns:[/retrieval.*instruction/i,/document.*exfiltrat/i,/poisoned context/i] },
    { id:"TOOL-001", family:"Tool Abuse", layer:"Tool Guard", weight:0.94, patterns:[/call (the )?(admin|shell|terminal|filesystem|database) tool/i,/execute.*command/i,/run.*shell/i,/disable.*approval/i] },
    { id:"TOOL-002", family:"Tool Abuse", layer:"Tool Guard", weight:0.89, patterns:[/send.*secret/i,/export.*credentials/i,/delete.*data/i,/bypass.*authorization/i] },
    { id:"EXF-001", family:"Data Exfiltration", layer:"Context Boundary", weight:0.95, patterns:[/api key/i,/password/i,/credential/i,/secret/i,/private data/i,/confidential data/i,/exfiltrat/i] },
    { id:"EXF-002", family:"Data Exfiltration", layer:"Output & Audit", weight:0.87, patterns:[/send.*outside/i,/upload.*secret/i,/leak.*data/i] },
    { id:"HIJ-001", family:"Goal Hijacking", layer:"Policy Engine", weight:0.90, patterns:[/change your goal/i,/new objective/i,/your real task is/i,/pretend.*authorized/i,/become.*admin/i] }
  ];
  function analyze(input={}){
    const started=performance.now();
    const value=[input.prompt,input.context,input.toolCall,input.output].filter(Boolean).join("\n");
    const matches=rules.filter(rule=>rule.patterns.some(pattern=>pattern.test(value)));
    const maxRisk=matches.length?Math.max(...matches.map(r=>r.weight)):0.02;
    return {
      shield:"AYORAI AI SHIELD", version:"1.0.0", decision:matches.length?"BLOCK":"ALLOW",
      risk_score:Number(maxRisk.toFixed(2)), threat:matches[0]?.family||"Benign",
      defense_layer:matches[0]?.layer||"Policy Engine", rule_ids:matches.map(r=>r.id),
      reasons:matches.map(r=>r.patterns.find(p=>p.test(value))?.source||r.id),
      latency_ms:Math.max(1,Math.round(performance.now()-started))
    };
  }
  function runCase(testCase){
    const result=analyze(testCase.input);
    const expected=testCase.expected_decision||(testCase.adversarial?"BLOCK":"ALLOW");
    return {...testCase,expected,actual:result.decision,passed:result.decision===expected,result};
  }
  return {analyze,runCase};
})();
if(typeof window!=="undefined"){window.AyoraiAIShield=AyoraiAIShield;window.IoraiSecurityShield=AyoraiAIShield;}
if(typeof module!=="undefined") module.exports=AyoraiAIShield;
