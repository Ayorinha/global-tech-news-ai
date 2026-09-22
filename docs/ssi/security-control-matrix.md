# SSI Security Control Matrix

This matrix is the implementation target for AYORAI SSI. A control is considered implemented only when it has a code path, a deterministic contract and regression evidence.

| Domain | Control | Enforcement point | Evidence |
|---|---|---|---|
| Identity | explicit actor/role | SSI gate | unit tests |
| Session | session binding | SSI request | regression tests |
| Provenance | source trust levels | provenance + gate | provenance tests |
| Information flow | integrity/confidentiality labels | IFC layer | security primitive tests |
| DLP | secrets/PII detection | DLP layer | DLP tests |
| Tool security | allowlisted tools | MCP registry | tool tests |
| Capability security | attenuation/no escalation | capability layer | capability tests |
| Approval | exact action digest | approval gate | approval tests |
| Replay | consumed approval tracking | control plane | replay tests |
| Runtime | sequence anomaly signals | runtime guard | runtime tests |
| Audit | tamper-evident hash chain | evidence layer | audit tests |
| Supply chain | artifact hashing/pinning | supply-chain layer | integrity tests |
| CI | compile/test/dependency audit | GitHub Actions | workflow |
| RAG | source provenance/poisoning defense | planned + benchmarked | benchmark plan |
| Multi-agent | delegated capability attenuation | capability layer + planned orchestration | regression suite |
| SOC | runtime escalation/evidence | runtime + audit | planned integration |

## Non-negotiable invariants

1. Model output never grants authorization.
2. Unknown tools fail closed.
3. Child capabilities cannot exceed parent capabilities.
4. Untrusted integrity cannot silently become trusted.
5. Confidentiality may only become stricter during propagation.
6. High-impact actions require bounded independent approval.
7. Approval is bound to an exact action digest.
8. Approval cannot be replayed.
9. Critical control failure fails closed for high-impact actions.
10. Public evaluation never reaches production credentials or uncontrolled external systems.
11. Security claims must reference a version, scenario set and evidence.
12. Detection signals are inputs to policy; they are not authorization by themselves.

## Assurance boundary

Passing these tests demonstrates behavior of the reference implementation for the covered synthetic scenarios. It is not a certification, formal proof of complete security, or evidence that all model families and production integrations are safe.
