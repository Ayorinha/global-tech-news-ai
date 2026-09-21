from dataclasses import dataclass, field
from typing import Any

from .knowledge import retrieve
from .policy import SafetyDecision, evaluate_request


@dataclass
class AgentResult:
    request: str
    answer: str
    sources: list[str] = field(default_factory=list)
    decision: SafetyDecision | None = None
    proposed_action: dict[str, Any] | None = None
    audit: dict[str, Any] = field(default_factory=dict)


class SecureOperationsAgent:
    """Deterministic agent showing a safe agentic control loop."""

    def run(self, request: str, approved: bool = False) -> AgentResult:
        decision = evaluate_request(request, approved=approved)
        context = retrieve(request)

        if decision.status == "BLOCK":
            answer = "Request blocked by the safety policy."
            action = None
        elif decision.status == "APPROVAL_REQUIRED" and not approved:
            answer = "I can prepare this operation, but human approval is required before execution."
            action = {
                "type": "PROPOSED_OPERATION",
                "requires_approval": True,
                "scope": decision.scope,
            }
        else:
            answer = self._draft_answer(request, context)
            action = {
                "type": "READ_ONLY_ASSISTANCE",
                "requires_approval": False,
                "scope": "local",
            }

        audit = {
            "agent": "AyorAI Secure Operations Agent",
            "request": request,
            "decision": decision.status,
            "risk": decision.risk,
            "sources": [item["id"] for item in context],
            "human_approved": approved,
        }
        return AgentResult(request, answer, [item["id"] for item in context], decision, action, audit)

    @staticmethod
    def _draft_answer(request: str, context: list[dict[str, str]]) -> str:
        if not context:
            return "No relevant local knowledge was found. I will not invent a procedure."
        topics = "; ".join(item["title"] for item in context[:3])
        return f"Prepared a local, read-only response for: {request}. Relevant knowledge: {topics}."
