"""Sequence-level tool authorization for AYORAI SSI."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ToolChainDecision:
    status: str
    reasons: tuple[str, ...] = ()


class ToolChainGuard:
    """Prevents individually-allowed tools from forming an unauthorized chain."""

    def evaluate(
        self,
        observed: tuple[str, ...],
        allowed_tools: frozenset[str],
        allowed_sequence: tuple[str, ...],
    ) -> ToolChainDecision:
        reasons: list[str] = []
        if any(tool not in allowed_tools for tool in observed):
            reasons.append("tool outside intent capability")
        if allowed_sequence:
            if len(observed) > len(allowed_sequence):
                reasons.append("tool chain exceeds approved sequence")
            elif observed != allowed_sequence[:len(observed)]:
                reasons.append("tool chain drift detected")
        return ToolChainDecision("ALLOW" if not reasons else "DENY", tuple(reasons))
