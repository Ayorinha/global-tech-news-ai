"""AYORAI SSI layered security control plane.

The model is not the authorization boundary. Policy is.
This module is intentionally deterministic and safe-by-default.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from hashlib import sha256
import json
import re
from typing import Any


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
            expected = sha256(json.dumps(body, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
            if event["previous_hash"] != previous or event["event_hash"] != expected:
                return False
            previous = event["event_hash"]
        return True


class ToolRegistry:
    """Explicit capability registry: no wildcard tools."""

    DEFAULTS = {
        "analyst": {"read_public", "read_internal"},
        "finance_manager": {"read_public", "read_internal", "create_payment_draft"},
        "auditor": {"read_public", "read_internal", "read_audit"},
    }

    def allowed(self, role: str, tool: str | None) -> bool:
        return tool is None or tool in self.DEFAULTS.get(role, set())


class SafetyGate:
    BLOCK_PATTERNS = (
        r"ignores+(alls+)?(previous|prior|trusted)s+instructions",
        r"reveals+(thes+)?(system|hidden|developer)s+prompt",
        r"bypasss+(security|policy|authorization)",
        r"disables+(security|logging|audit)",
        r"exfiltrat",
        r"steals+(credentials|data|secrets)",
    )
    SENSITIVE_PATTERNS = (
        r"password", r"api[_ -]?key", r"credential", r"secret", r"token",
        r"cpf", r"cnpj", r"account", r"salary", r"credit card",
    )
    HIGH_IMPACT_TOOLS = {"create_payment_draft", "delete_record", "write_database", "publish_external"}

    def inspect(self, request: SecurityRequest, approved: bool = False) -> PolicyDecision:
        text = request.request.lower()
        reasons: list[str] = []
        layers = ["identity", "provenance", "data", "context", "tool", "policy", "safety_gate", "audit"]

        injection = any(re.search(p, text) for p in self.BLOCK_PATTERNS)
        sensitive = any(re.search(p, text) for p in self.SENSITIVE_PATTERNS)
        tool_allowed = ToolRegistry().allowed(request.role, request.tool)
        high_impact = request.tool in self.HIGH_IMPACT_TOOLS or (request.amount or 0) > 10000

        if injection:
            reasons.append("context attack indicator detected")
        if sensitive:
            reasons.append("sensitive-data indicator detected")
        if not tool_allowed:
            reasons.append("tool outside role capability")
        if request.provenance not in {"user", "trusted_internal"}:
            reasons.append("untrusted provenance")
        if request.amount is not None and request.amount <= 0:
            reasons.append("invalid transaction amount")

        approval_required = high_impact and tool_allowed
        if approval_required and not approved:
            reasons.append("independent human approval required")

        if injection or not tool_allowed or request.provenance not in {"user", "trusted_internal"}:
            status, risk = "BLOCK", "HIGH"
        elif approval_required and not approved:
            status, risk = "APPROVAL_REQUIRED", "HIGH"
        elif sensitive:
            status, risk = "BLOCK", "HIGH"
        else:
            status, risk = "ALLOW", "LOW"

        redacted = re.sub(r"(?i)\b(?:password|secret|token|api[_ -]?key|credential)\s*[:=]\s*[^\s,;]+", "[REDACTED-CREDENTIAL]", request.request)
        proposed = None
        if status == "APPROVAL_REQUIRED":
            proposed = {
                "type": "PROPOSED_ACTION",
                "tool": request.tool,
                "amount": request.amount,
                "scope": "exact-request-only",
                "requires_approval": True,
            }

        return PolicyDecision(
            status=status,
            risk=risk,
            layers=tuple(layers),
            reasons=tuple(reasons),
            requires_human_approval=approval_required,
            allowed_tool=tool_allowed,
            redacted_request=redacted,
            proposed_action=proposed,
        )


class SSIControlPlane:
    """Single orchestration point for the defensive layers."""

    def __init__(self) -> None:
        self.gate = SafetyGate()
        self.audit = AuditChain()

    def evaluate(self, request: SecurityRequest, approved: bool = False) -> PolicyDecision:
        decision = self.gate.inspect(request, approved=approved)
        self.audit.append("POLICY_DECISION", {
            "actor": request.actor,
            "role": request.role,
            "tool": request.tool,
            "decision": decision.status,
            "risk": decision.risk,
            "reasons": list(decision.reasons),
        })
        return decision
