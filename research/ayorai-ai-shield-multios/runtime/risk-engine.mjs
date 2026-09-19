export const RISK_ENGINE_VERSION = "0.1.0";

const weights = {
  prompt_injection: 0.72,
  rag_poisoning: 0.78,
  tool_abuse: 0.86,
  data_exfiltration: 0.92,
  goal_hijacking: 0.82,
  suspicious_process: 0.76,
  suspicious_network: 0.68
};

export function scoreRisk(indicators = [], context = {}) {
  const families = indicators.map(i => typeof i === "string" ? i : i.family).filter(Boolean);
  const base = families.reduce((max, family) => Math.max(max, weights[normalize(family)] || 0), 0);
  const contextBoost = context.privileged === true ? 0.08 : 0;
  const score = Math.min(1, Number((base + contextBoost).toFixed(2)));
  const confidence = families.length ? Math.min(1, Number((0.55 + Math.min(families.length, 4) * 0.1).toFixed(2))) : 0.2;
  return { score, confidence, engine_version: RISK_ENGINE_VERSION };
}

function normalize(value) {
  return String(value).toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
}
