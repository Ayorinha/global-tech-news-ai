# AYORAI AI Shield — Universal Security Event Schema

The event schema is the contract between sensors, policy, detection, correlation, response and evidence.

## Canonical event

```json
{
  "schema_version": "1.0",
  "event_id": "stable-unique-id",
  "timestamp": "UTC",
  "platform": "windows|macos|linux|server|container|mobile|cloud",
  "source": {
    "sensor": "endpoint|network|identity|email|web|file|ai|threat-intel",
    "version": "version"
  },
  "asset": {
    "id": "opaque-id",
    "type": "endpoint|server|workload|identity|application|data"
  },
  "actor": {
    "type": "user|process|service|agent|external"
  },
  "action": {
    "type": "execute|read|write|connect|authenticate|download|upload|tool-call|policy-change",
    "target": "normalized-target"
  },
  "context": {},
  "indicators": [],
  "risk": {
    "score": 0,
    "confidence": 0
  },
  "decision": {
    "action": "ALLOW|WARN|BLOCK|QUARANTINE|ISOLATE|ESCALATE",
    "policy_id": "policy-id"
  },
  "response": {},
  "evidence": {
    "hash": "optional-integrity-hash",
    "retention_class": "standard|high-assurance"
  }
}
```

## Design rules

- No secrets in telemetry by default.
- Identity values should be opaque or minimized.
- Timestamps use UTC.
- Risk scores must carry versioned methodology.
- Decisions must be attributable to a policy/rule/model version.
- High-impact actions require evidence.
- Schema changes require compatibility testing and versioning.

## Lifecycle

**Sensor → Normalize → Enrich → Correlate → Decide → Respond → Record → Review**

The schema is a research contract until implemented in runtime code.
