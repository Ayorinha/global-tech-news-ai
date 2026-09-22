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

## Security transaction

Privileged execution is represented as a transaction that binds:

- requester and session context;
- operation and resource;
- purpose;
- provenance and data classification;
- policy version;
- nonce and expiry;
- immutable intent hash;
- cryptographic capability.

The transaction hash is the common binding presented to independent semantic and capability defenses. The reconciler can only return `EXECUTE` when both defenses allow the same transaction; disagreement becomes `QUARANTINE`.

## Intent and trajectory controls

An intent contract defines the declared goal, resource, purpose, allowed operations, allowed tools and optional ordered tool sequence.

Execution is constrained by two sequence checks:

1. **Tool-chain guard:** the observed tool chain must remain inside the contract.
2. **Trajectory guard:** the observed execution trajectory must remain a prefix of the approved sequence.

These controls address a key failure mode of agentic systems: an individually permitted tool can still become dangerous when combined with another permitted action.

## Information-flow control

Information-flow labels carry integrity and confidentiality independently from the model's interpretation.

A release is permitted only when:

`source integrity >= sink integrity`

and

`source confidentiality <= sink confidentiality`

A restricted/confidential source therefore cannot be downgraded to a public sink merely because an agent requests the release.

## Security invariant

`model -> intent -> transaction -> policy + capability -> reconciliation -> controlled action`

Never:

`model -> authority`

or:

`model -> tool`

## Failure mode

When a required control is unavailable, ambiguous, malformed, inconsistent, outside the intent contract, violates information flow, or shows trajectory/tool-chain drift, SSI fails closed for privileged operations.

## Product boundary

SSI is a research reference architecture, not a certification, formal proof, production HSM/TEE, or guarantee that an AI system cannot be compromised. Security claims must remain scoped to implemented controls, benchmark scenarios, versions and evidence.
