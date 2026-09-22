"""Bounded, exact-action human approval primitive."""

from dataclasses import dataclass
from hashlib import sha256
import json


@dataclass(frozen=True)
class Approval:
    approval_id: str
    approver: str
    action_digest: str
    scope: str
    status: str = "APPROVED"


def action_digest(action: dict) -> str:
    return sha256(
        json.dumps(action, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()
    ).hexdigest()


def issue_approval(
    approver: str,
    action: dict,
    scope: str = "exact-request-only",
) -> Approval:
    if not approver.strip():
        raise ValueError("approver is required")
    if not action:
        raise ValueError("action is required")
    if scope != "exact-request-only":
        raise ValueError("only exact-request-only approvals are supported")
    digest = action_digest(action)
    approval_id = "APR-" + digest[:16]
    return Approval(approval_id, approver, digest, scope)


def validate_approval(approval: Approval, action: dict) -> bool:
    return (
        approval.status == "APPROVED"
        and approval.scope == "exact-request-only"
        and approval.action_digest == action_digest(action)
    )
