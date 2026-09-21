"""Deterministic runtime behavior guard for agent/tool sequences."""

from collections import Counter, deque

class RuntimeGuard:
    def __init__(self, max_events: int = 100) -> None:
        self.events = deque(maxlen=max_events)
        self.counts = Counter()

    def observe(self, actor: str, event: str) -> str:
        self.events.append((actor, event))
        self.counts[(actor, event)] += 1
        recent = [e for a, e in list(self.events)[-6:] if a == actor]
        if self.counts[(actor, event)] > 100:
            return "QUARANTINE"
        if {"read_internal", "publish_external"} <= set(recent):
            return "ESCALATE"
        if "credential_access" in recent and "publish_external" in recent:
            return "BLOCK"
        return "NORMAL"
