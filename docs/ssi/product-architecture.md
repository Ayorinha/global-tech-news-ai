# AYORAI SSI product architecture

## Product concept

**AYORAI SSI — Secure Systems Intelligence** is a defense-in-depth security control plane for intelligent applications.

It can sit between an AI application and the systems that contain sensitive data or perform consequential actions.

```
Applications / Agents / Copilots
              |
              v
      +-------------------+
      | AYORAI SSI Gateway|
      +-------------------+
              |
  +-----------+-----------+
  |           |           |
Identity   Context      Data
  |        / RAG       Security
  +-----------+-----------+
              |
        AI Threat Defense
              |
         Tool / MCP Guard
              |
        Policy-as-Code
              |
         Safety Gate
              |
      Human Approval
              |
       Action Sandbox
              |
       Audit / Evidence
              |
        Enterprise SOC
```

## Product modules

- **SSI Gateway** — common ingress/egress security boundary.
- **AI Shield** — prompt, context and output defenses.
- **RAG Security** — provenance, trust and retrieval controls.
- **MCP Security** — tool identity, schema, permissions and egress controls.
- **Agent Defense** — red/blue evaluation and continuous regression.
- **Safety Gate** — policy decision point.
- **Approval Control** — exact-action, time-bounded human authorization.
- **AI Antivirus** — runtime anomaly and malicious-content defense.
- **Audit & Evidence** — security event and decision trail.

## Deployment profiles

### Enterprise
Gateway + policy service + identity provider + SIEM + secrets manager + isolated tool runtime.

### Financial
Adds transaction limits, separation of duties, dual approval and immutable evidence requirements.

### Regulated data
Adds data classification, DLP, retention controls, provenance and access review.

### Development
Local deterministic mode with synthetic data and no external action.

## Productization path

1. Open-source reference implementation.
2. SDK and policy-as-code format.
3. Security gateway API.
4. Dashboard and evidence export.
5. Enterprise integrations.
6. Continuous red-team service.

The implementation must preserve the same authorization invariant across every deployment profile: **the model proposes; policy authorizes.**
