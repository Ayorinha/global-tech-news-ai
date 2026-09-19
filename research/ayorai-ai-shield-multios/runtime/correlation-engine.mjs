export const CORRELATION_ENGINE_VERSION = "0.1.0";

export function correlate(events = []) {
  const groups = new Map();
  for (const event of events) {
    const key = event.asset?.id || "unknown";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(event);
  }
  return [...groups.entries()].map(([asset_id, assetEvents]) => {
    const scores = assetEvents.map(e => Number(e.risk?.score || 0));
    const maxRisk = scores.length ? Math.max(...scores) : 0;
    const families = [...new Set(assetEvents.flatMap(e => (e.indicators || []).map(i => typeof i === "string" ? i : i.family).filter(Boolean)))];
    return {
      correlation_engine_version: CORRELATION_ENGINE_VERSION,
      asset_id,
      event_count: assetEvents.length,
      max_risk: maxRisk,
      families,
      priority: maxRisk >= 0.85 ? "high" : maxRisk >= 0.55 ? "medium" : "low"
    };
  });
}
