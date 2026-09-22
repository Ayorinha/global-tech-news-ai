from dataclasses import dataclass, field
from typing import Any

from .approval import Approval, issue_approval
from .knowledge import retrieve
from .ssi_core import SecurityRequest, SSIControlPlane


@dataclass
class AgentResult:
    request: str
    answer: str
    sources: list[str] = field(default_factory=list)
    decision: Any = None
    proposed_action: dict[str, Any] | None = None
    audit: dict[str, Any] = field(default_factory=dict)


class SecureOperationsAgent:
    """Reference agent whose output has no authority until SSI authorizes it."""

    def __init__(self) -> None:
        self.control = SSIControlPlane()

    def run(
        self,
        request: str,
        *,
        actor: str = "local-user",
        role: str = "analyst",
        tool: str | None = None,
        amount: float | None = None,
        data_classification: str = "PUBLIC",
        provenance: str = "user",
        session_id: str = "local-session",
        approval: Approval | None = None,
    ) -> AgentResult:
        context = retrieve(request)
        decision = self.control.evaluate(
            SecurityRequest(
                actor=actor,
                role=role,
                request=request,
                data_classification=data_classification,
                tool=tool,
                amount=amount,
                provenance=provenance,
                session_id=session_id,
            ),
            approval=approval,
        )

        if decision.status == "BLOCK":
            answer = "Request blocked by AYORAI SSI."
            action = None
        elif decision.status == "APPROVAL_REQUIRED":
            answer = "Prepared only. Independent human approval is required."
            action = decision.proposed_action
        else:
            answer = self._draft_answer(request, context)
            action = {"type": "READ_ONLY_ASSISTANCE", "scope": "local"}

        audit = {
            "agent": "AYORAI SSI Secure Operations Agent",
            "decision": decision.status,
            "risk": decision.risk,
            "sources": [item["id"] for item in context],
            "audit_chain_valid": self.control.audit.verify(),
        }
        return AgentResult(
            request=request,
            answer=answer,
            sources=[item["id"] for item in context],
            decision=decision,
            proposed_action=action,
            audit=audit,
        )

    @staticmethod
    def _draft_answer(request: str, context: list[dict[str, str]]) -> str:
        if not context:
            return "No relevant local knowledge was found. I will not invent a procedure."
        topics = "; ".join(item["title"] for item in context[:3])
        return f"Prepared a local, read-only response for: {request}. Relevant knowledge: {topics}."
