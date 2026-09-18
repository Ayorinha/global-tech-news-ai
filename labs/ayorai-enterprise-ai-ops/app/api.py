from fastapi import FastAPI

from .models import OperationRequest, OperationResponse
from .orchestrator import Orchestrator

app = FastAPI(title="AYORAI Enterprise AI Operations", version="0.1.0")
orchestrator = Orchestrator()

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ayorai-enterprise-ai-ops"}

@app.post("/operate", response_model=OperationResponse)
def operate(request: OperationRequest) -> OperationResponse:
    result = orchestrator.handle(request.query, request.role)
    return OperationResponse(
        decision=result["decision"],
        route=result["route"],
        requires_approval=result["requires_approval"],
        message=result["reason"],
    )
