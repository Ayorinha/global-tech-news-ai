# SSI Enterprise Reference Architecture

## Deployment tiers

### Tier 0 — Research
Local deterministic engine, synthetic data, no external actions.

### Tier 1 — Application
SSI SDK embedded in an AI application.

### Tier 2 — Gateway
Central SSI Gateway between applications/agents and enterprise tools.

### Tier 3 — Enterprise Security
Gateway + identity provider + policy service + DLP + secrets manager + SIEM/SOC + immutable evidence.

### Tier 4 — Financial Critical
Tier 3 plus transaction limits, separation of duties, dual approval, step-up authentication, immutable evidence and emergency stop.

## Trust zones

`USER -> IDENTITY -> AI APP -> SSI TRUST BOUNDARY -> DATA/RAG -> TOOL/MCP -> EXECUTION -> SOC/EVIDENCE`

No single model or agent should bridge all zones without explicit controls.