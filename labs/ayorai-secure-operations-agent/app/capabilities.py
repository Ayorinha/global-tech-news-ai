"""Capability-based authorization primitives for AYORAI SSI."""

from dataclasses import dataclass

LEVELS = {"PUBLIC": 0, "INTERNAL": 1, "CONFIDENTIAL": 2, "RESTRICTED": 3}

@dataclass(frozen=True)
class Capability:
    name: str
    resource: str
    actions: frozenset[str]
    max_data_classification: str = "PUBLIC"
    max_amount: float | None = None

def attenuate(parent: Capability, *, actions: frozenset[str] | None = None,
              max_data_classification: str | None = None,
              max_amount: float | None = None) -> Capability:
    child_actions = parent.actions if actions is None else actions
    if not child_actions <= parent.actions:
        raise ValueError("child capability exceeds parent actions")
    child_class = parent.max_data_classification if max_data_classification is None else max_data_classification
    if child_class not in LEVELS or LEVELS[child_class] > LEVELS[parent.max_data_classification]:
        raise ValueError("child capability exceeds parent data classification")
    if parent.max_amount is not None and max_amount is not None and max_amount > parent.max_amount:
        raise ValueError("child capability exceeds parent amount")
    return Capability(parent.name + ":child", parent.resource, frozenset(child_actions),
                      child_class, max_amount if max_amount is not None else parent.max_amount)

def permits(capability: Capability, action: str, data_classification: str,
            amount: float | None = None) -> bool:
    if action not in capability.actions:
        return False
    if data_classification not in LEVELS or LEVELS[data_classification] > LEVELS[capability.max_data_classification]:
        return False
    if capability.max_amount is not None and amount is not None and amount > capability.max_amount:
        return False
    return True
