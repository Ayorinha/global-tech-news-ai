"""Intent contracts bind an agent transaction to an explicit objective.

The contract is a constraint, not an authority source. It narrows what may be
executed and can only be satisfied when the SecurityTransaction carries the
same immutable intent hash.
"""
from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
import json


CLASSIFICATION_LEVELS = {
    "PUBLIC": 0,
    "INTERNAL": 1,
    "CONFIDENTIAL": 2,
    "RESTRICTED": 3,
}


def _canonical(payload: dict) -> bytes:
    return json.dumps(
        payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode()


@dataclass(frozen=True)
class IntentContract:
    goal: str
    resource: str
    purpose: str
    allowed_operations: frozenset[str]
    allowed_tools: frozenset[str] = frozenset()
    allowed_sequence: tuple[str, ...] = ()
    max_data_classification: str = "PUBLIC"

    def __post_init__(self) -> None:
        if self.max_data_classification not in CLASSIFICATION_LEVELS:
            raise ValueError("invalid intent data classification")
        if any(tool not in self.allowed_tools for tool in self.allowed_sequence):
            raise ValueError("approved sequence contains a tool outside allowed_tools")

    def canonical(self) -> dict:
        return {
            "goal": self.goal.strip(),
            "resource": self.resource,
            "purpose": self.purpose,
            "allowed_operations": sorted(self.allowed_operations),
            "allowed_tools": sorted(self.allowed_tools),
            "allowed_sequence": list(self.allowed_sequence),
            "max_data_classification": self.max_data_classification,
        }

    @property
    def intent_hash(self) -> str:
        return sha256(_canonical(self.canonical())).hexdigest()

    def validate_transaction(self, tx) -> tuple[bool, tuple[str, ...]]:
        reasons: list[str] = []
        if not self.goal.strip():
            reasons.append("intent goal missing")
        if tx.context_hash != self.intent_hash:
            reasons.append("transaction intent hash mismatch")
        if tx.resource != self.resource:
            reasons.append("intent resource mismatch")
        if tx.purpose != self.purpose:
            reasons.append("intent purpose mismatch")
        if tx.operation not in self.allowed_operations:
            reasons.append("operation outside intent contract")
        tx_class = CLASSIFICATION_LEVELS.get(tx.data_classification)
        if tx_class is None:
            reasons.append("transaction classification invalid")
        elif tx_class > CLASSIFICATION_LEVELS[self.max_data_classification]:
            reasons.append("transaction classification exceeds intent")
        return not reasons, tuple(reasons)
