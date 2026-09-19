import http from "node:http";
import { createControlPlane } from "./local-control-plane.mjs";
import { correlate } from "../runtime/correlation-engine.mjs";

export function createSecurityCenter({ host = "127.0.0.1", port = 8788 } = {}) {
  const control = createControlPlane({ host, port: port - 1 });
  const server = http.createServer((req, res) => {
    res.setHeader("content-type", "application/json; charset=utf-8");
    if (req.url === "/dashboard") {
      const events = control.state.events;
      return send(res, 200, {
        product: "AYORAI AI SHIELD",
        mode: "research",
        status: "ONLINE",
        telemetry: { events: events.length, assets: new Set(events.map(e => e.asset.id)).size },
        correlations: correlate(events)
      });
    }
    if (req.url === "/health") return send(res, 200, { status: "ok", component: "security-center", mode: "research" });
    return send(res, 404, { error: "not_found" });
  });
  return { server, control, start: () => Promise.all([control.start(), new Promise(resolve => server.listen(port, host, () => resolve(server.address())))]) };
}
function send(res, status, payload) { res.statusCode = status; res.end(JSON.stringify(payload)); }

if (import.meta.url === `file://${process.argv[1]}`) {
  const center = createSecurityCenter();
  center.start().then(addresses => console.log("AYORAI Security Center research mode:", addresses));
}
