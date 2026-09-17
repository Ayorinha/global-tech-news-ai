from pathlib import Path
import json
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from .cli import run

app = FastAPI(title="AyorAI Agent Defense Lab", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok", "sandbox": True, "external_targets": False}


@app.post("/benchmark")
def benchmark():
    return run()


@app.get("/", response_class=HTMLResponse)
def dashboard():
    return Path("dashboard/index.html").read_text(encoding="utf-8")
