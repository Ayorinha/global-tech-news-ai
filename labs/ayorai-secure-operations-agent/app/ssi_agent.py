from dataclasses import dataclass, field
from typing import Any

from .approval import Approval
from .knowledge import retrieve
from .ssi_core import SecurityRequest, SSIControlPlane


@dataclass
class SSIResult:
    request: str
    answer: str
    decision: Any
    sources: list[str] = field(default_factory=list)
    proposed_action: dict[str, Any] | None = None
    audit_verified: bool = False


class SSIAgent:
    """Reference agent that routes every request through SSI before action."""

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
    ) -> SSIResult:
        decision = self.control.evaluate(
            SecurityRequest(
                actor=actor,
                role=role,
                request=request,
                tool=tool,
                amount=amount,
                data_classification=data_classification,
                provenance=provenance,
                session_id=session_id,
            ),
            approval=approval,
        )
        context = retrieve(request)
        sources = [item["id"] for item in context]

        if decision.status == "BLOCK":
            answer = "Blocked by AYORAI SSI."
            action = None
        elif decision.status == "APPROVAL_REQUIRED":
            answer = "Prepared only. Independent human approval is required."
            action = decision.proposed_action
        else:
            answer = "Allowed read-only assistance based on local evidence."
            action = {"type": "READ_ONLY_ASSISTANCE", "scope": "local"}

        return SSIResult(
            request=request,
            answer=answer,
            decision=decision,
            sources=sources,
            proposed_action=action,
            audit_verified=self.control.audit.verify(),
        )
