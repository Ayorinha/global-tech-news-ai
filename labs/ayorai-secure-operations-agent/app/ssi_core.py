"""AYORAI SSI deterministic security control plane.

Core invariant:
    model -> proposal -> policy -> gate -> controlled action

The model is never the authorization boundary.
This public reference implementation is local, synthetic and fail-closed.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from hashlib import sha256
import json
import re
from typing import Any

from .approval import Approval, action_digest, validate_approval
from .mcp_guard import MCPToolRegistry
from .provenance import TRUST_LEVELS


DATA_LEVELS = {"PUBLIC": 0, "INTERNAL": 1, "CONFIDENTIAL": 2, "RESTRICTED": 3}
ALLOWED_ROLES = {"analyst", "finance_manager", "auditor"}


@dataclass(frozen=True)
class SecurityRequest:
    actor: str
    role: str
    request: str
    data_classification: str = "PUBLIC"
    tool: str | None = None
    amount: float | None = None
    provenance: str = "user"
    session_id: str = "local-session"


@dataclass(frozen=True)
class PolicyDecision:
    status: str
    risk: str
    layers: tuple[str, ...]
    reasons: tuple[str, ...] = ()
    requires_human_approval: bool = False
    allowed_tool: bool = False
    redacted_request: str = ""
    proposed_action: dict[str, Any] | None = None


@dataclass
class AuditChain:
    events: list[dict[str, Any]] = field(default_factory=list)
    _previous_hash: str = "GENESIS"

    def append(self, event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        event = {
            "event_type": event_type,
            "payload": payload,
            "previous_hash": self._previous_hash,
        }
        canonical = json.dumps(event, sort_keys=True, ensure_ascii=False).encode()
        event["event_hash"] = sha256(canonical).hexdigest()
        self._previous_hash = event["event_hash"]
        self.events.append(event)
        return event

    def verify(self) -> bool:
        previous = "GENESIS"
        for event in self.events:
            body = {
                "event_type": event["event_type"],
                "payload": event["payload"],
                "previous_hash": event["previous_hash"],
            }
            expected = sha256(
                json.dumps(body, sort_keys=True, ensure_ascii=False).encode()
            ).hexdigest()
            if event.get("previous_hash") != previous or event.get("event_hash") != expected:
                return False
            previous = event["event_hash"]
        return True


class SafetyGate:
    """Policy gate combining identity, provenance, data, tool and action controls."""

    BLOCK_PATTERNS = (
        r"ignore\s+(all\s+)?(previous|prior|trusted)\s+instructions",
        r"reveal\s+(the\s+)?(system|hidden|developer)\s+prompt",
        r"bypass\s+(security|policy|authorization)",
        r"disable\s+(security|logging|audit)",
        r"exfiltrat",
        r"steal\s+(credentials|data|secrets)",
    )
    SENSITIVE_PATTERNS = (
        r"password", r"api[_ -]?key", r"credential", r"secret", r"token",
        r"\bcpf\b", r"\bcnpj\b", r"salary", r"credit\s+card",
    )
    HIGH_IMPACT_TOOLS = {
        "create_payment_draft", "delete_record", "write_database", "publish_external"
    }

    def __init__(self) -> None:
        self.tools = MCPToolRegistry()

    @staticmethod
    def _redact(text: str) -> str:
        return re.sub(
            r"(?i)\b(?:password|secret|token|api[_ -]?key|credential)\s*[:=]\s*[^\s,;]+",
            "[REDACTED-CREDENTIAL]",
            text,
        )

    def inspect(
        self,
        request: SecurityRequest,
        approval: Approval | None = None,
        used_approvals: set[str] | None = None,
    ) -> PolicyDecision:
        reasons: list[str] = []
        layers = (
            "identity", "provenance", "data", "context", "tool",
            "policy", "safety_gate", "human_control", "audit",
        )
        text = request.request.lower()

        if request.role not in ALLOWED_ROLES:
            reasons.append("unknown role")
        if not request.actor.strip():
            reasons.append("missing actor")
        if not request.session_id.strip():
            reasons.append("missing session")
        if request.data_classification not in DATA_LEVELS:
            reasons.append("invalid data classification")
        if request.provenance not in TRUST_LEVELS:
            reasons.append("unknown provenance")
        if request.amount is not None and request.amount <= 0:
            reasons.append("invalid transaction amount")

        injection = any(re.search(pattern, text) for pattern in self.BLOCK_PATTERNS)
        sensitive = any(re.search(pattern, text) for pattern in self.SENSITIVE_PATTERNS)
        if injection:
            reasons.append("context attack indicator detected")
        if sensitive:
            reasons.append("sensitive-data indicator detected")

        tool_ok, tool_reason = self.tools.authorize(
            request.role, request.tool, request.amount, request.data_classification
        )
        if not tool_ok:
            reasons.append(f"tool denied: {tool_reason}")

        spec = self.tools.spec(request.tool)
        high_impact = request.tool in self.HIGH_IMPACT_TOOLS or (request.amount or 0) > 10000
        approval_required = high_impact and tool_ok

        action = {
            "actor": request.actor,
            "role": request.role,
            "request": request.request,
            "data_classification": request.data_classification,
            "tool": request.tool,
            "amount": request.amount,
            "provenance": request.provenance,
            "session_id": request.session_id,
        }
        digest = action_digest(action)

        if approval_required:
            if approval is None:
                reasons.append("independent human approval required")
            elif approval.approver == request.actor:
                reasons.append("separation of duties violation")
            elif approval.approval_id in (used_approvals or set()):
                reasons.append("approval replay detected")
            elif not validate_approval(approval, action):
                reasons.append("approval does not bind to exact action")
            else:
                reasons.append("approval validated for exact action")

        if (
            injection
            or reasons[:3] and any(
                reason in {"unknown role", "missing actor", "missing session",
                           "invalid data classification", "unknown provenance"}
                for reason in reasons
            )
            or not tool_ok
            or request.provenance not in {"user", "trusted_internal"}
            or sensitive
            or (request.amount is not None and request.amount <= 0)
        ):
            status, risk = "BLOCK", "HIGH"
        elif approval_required and not (
            approval
            and approval.approver != request.actor
            and approval.approval_id not in (used_approvals or set())
            and validate_approval(approval, action)
        ):
            status, risk = "APPROVAL_REQUIRED", "HIGH"
        else:
            status, risk = "ALLOW", "LOW" if not high_impact else "HIGH"

        proposed = None
        if status == "APPROVAL_REQUIRED":
            proposed = {
                "type": "PROPOSED_ACTION",
                "action": action,
                "action_digest": digest,
                "scope": "exact-request-only",
                "requires_approval": True,
            }

        return PolicyDecision(
            status=status,
            risk=risk,
            layers=layers,
            reasons=tuple(reasons),
            requires_human_approval=approval_required,
            allowed_tool=tool_ok,
            redacted_request=self._redact(request.request),
            proposed_action=proposed,
        )


class SSIControlPlane:
    """Single authorization point for all controlled actions."""

    def __init__(self) -> None:
        self.gate = SafetyGate()
        self.audit = AuditChain()
        self._used_approvals: set[str] = set()

    def evaluate(
        self,
        request: SecurityRequest,
        approval: Approval | None = None,
    ) -> PolicyDecision:
        decision = self.gate.inspect(
            request, approval=approval, used_approvals=self._used_approvals
        )

        payload = {
            "actor": request.actor,
            "role": request.role,
            "tool": request.tool,
            "decision": decision.status,
            "risk": decision.risk,
            "reasons": list(decision.reasons),
            "request": decision.redacted_request,
        }
        self.audit.append("POLICY_DECISION", payload)

        if decision.status == "ALLOW" and approval is not None:
            self._used_approvals.add(approval.approval_id)
            self.audit.append(
                "APPROVAL_CONSUMED",
                {"approval_id": approval.approval_id, "actor": request.actor},
            )
        return decision
