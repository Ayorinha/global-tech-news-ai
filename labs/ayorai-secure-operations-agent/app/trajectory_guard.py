"""Deterministic plan/trajectory drift detection."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TrajectoryDecision:
    status: str
    reasons: tuple[str, ...] = ()


class TrajectoryGuard:
    """Observed execution must remain a prefix of the approved trajectory."""

    def evaluate(
        self,
        observed: tuple[str, ...],
        approved: tuple[str, ...],
    ) -> TrajectoryDecision:
        reasons: list[str] = []
        if len(observed) > len(approved):
            reasons.append("trajectory exceeds approved plan")
        elif observed != approved[:len(observed)]:
            reasons.append("trajectory drift detected")
        return TrajectoryDecision("ALLOW" if not reasons else "QUARANTINE", tuple(reasons))
