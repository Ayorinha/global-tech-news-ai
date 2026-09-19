import http from "node:http";
import { createSecurityEvent } from "../runtime/event-core.mjs";
import { scoreRisk } from "../runtime/risk-engine.mjs";
import { decide } from "../runtime/policy-engine.mjs";

export function createControlPlane({ host = "127.0.0.1", port = 8787 } = {}) {
  const state = { events: [], started_at: new Date().toISOString() };
  const server = http.createServer(async (req, res) => {
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("x-ayorai-control-plane", "research-0.1.0");
    if (req.method === "GET" && req.url === "/health") return send(res, 200, { status: "ok", mode: "local-research", events: state.events.length });
    if (req.method === "GET" && req.url === "/events") return send(res, 200, { events: state.events });
    if (req.method === "POST" && req.url === "/events") {
      const body = await readJson(req);
      const risk = scoreRisk(body.indicators, body.context);
      const decision = decide({ risk: risk.score, requestedAction: body.action?.type });
      const event = createSecurityEvent({
        ...body,
        risk,
        decision,
        source: { sensor: body.source?.sensor || "control-plane", version: "0.1.0" }
      });
      state.events.push(event);
      return send(res, 201, event);
    }
    return send(res, 404, { error: "not_found" });
  });
  return { server, state, start: () => new Promise(resolve => server.listen(port, host, () => resolve(server.address()))) };
}

function send(res, status, payload) { res.statusCode = status; res.end(JSON.stringify(payload)); }
async function readJson(req) {
  let data = "";
  for await (const chunk of req) data += chunk;
  return data ? JSON.parse(data) : {};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cp = createControlPlane();
  cp.start().then(address => console.log(`AYORAI local control plane listening on http://${address.address}:${address.port}`));
}
