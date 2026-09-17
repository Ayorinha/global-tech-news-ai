from pathlib import Path
import json
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from .arena import AgentArena
from .cli import run

ROOT = Path(__file__).resolve().parent.parent
app = FastAPI(title="AyorAI Agent Defense Lab", version="0.2.0")


@app.get("/health")
def health():
    return {"status": "ok", "sandbox": True, "synthetic_data_only": True, "external_targets": False}


@app.get("/scenarios")
def scenarios():
    from .scenarios import SCENARIOS
    return [s.model_dump() for s in SCENARIOS]


@app.post("/benchmark")
def benchmark():
    return run()


@app.post("/arena")
def arena():
    results = AgentArena().run()
    return {"results": [r.model_dump() for r in results]}


@app.get("/audit")
def audit():
    arena_run = AgentArena()
    arena_run.run()
    return {"events": arena_run.audit.export(), "ledger": arena_run.ledger.snapshot()}


@app.get("/", response_class=HTMLResponse)
def dashboard():
    return (ROOT / "dashboard" / "index.html").read_text(encoding="utf-8")
