from datetime import datetime, timezone
from hashlib import sha256
import json


class AuditLog:
    """Append-only local audit trail for benchmark decisions."""

    def __init__(self) -> None:
        self.events: list[dict] = []

    def append(self, event_type: str, payload: dict) -> dict:
        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "payload": payload,
        }
        canonical = json.dumps(event, sort_keys=True, ensure_ascii=False).encode()
        event["event_hash"] = sha256(canonical).hexdigest()
        self.events.append(event)
        return event

    def export(self) -> list[dict]:
        return list(self.events)
