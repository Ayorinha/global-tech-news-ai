# SSI Architecture — Defense in Depth

AYORAI SSI is a security control plane between intelligent applications and sensitive enterprise data or tools.

## Ten-layer control model

| Layer | Boundary | Required control |
|---|---|---|
| L0 Identity | Who is acting? | identity, role, session, delegation |
| L1 Provenance | Where did content come from? | integrity/trust labels, hashes |
| L2 Data | What data is involved? | classification, minimization, DLP |
| L3 AI Defense | Is content trying to control the agent? | injection/jailbreak/poisoning detection |
| L4 Tool/MCP | What capability is requested? | explicit registry, schema, allowlist |
| L5 Policy | Is this actor authorized? | RBAC/ABAC, limits, separation of duties |
| L6 Safety Gate | What is the decision? | fail-closed block/allow/approval |
| L7 Human Control | Is independent authorization required? | exact-action approval, expiry, dual control |
| L8 Execution | Can an action actually occur? | isolated sandbox, egress control |
| L9 Evidence | Can the decision be reconstructed? | structured events, hash chain, provenance |

## Security invariant

`model -> proposal -> policy -> gate -> controlled action`

Never: `model -> tool`

## Failure mode

When a required control is unavailable, ambiguous, malformed, or inconsistent, SSI fails closed for privileged operations.

## Product boundary

SSI is not a promise that an AI system cannot be compromised. It is a defense-in-depth control architecture intended to reduce unauthorized influence and contain failures.