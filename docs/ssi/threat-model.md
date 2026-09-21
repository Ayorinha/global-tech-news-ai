# AYORAI SSI threat model

SSI treats the AI model as an untrusted decision component. Authorization is external to the model.

| Threat | Primary layer | Control | Evidence |
|---|---|---|---|
| Direct prompt injection | AI / Prompt Defense | pattern detection + policy | regression case |
| Indirect prompt injection | Provenance / Context | trust boundary + source hashing | provenance record |
| RAG poisoning | Provenance / Context | source trust + future signed corpus | roadmap benchmark |
| Sensitive-data disclosure | Data Security | classification + redaction + block | redaction tests |
| Tool abuse | Tool / MCP | explicit registry + role allowlist | tool tests |
| Privilege escalation | Identity / Policy | role capability matrix | authorization tests |
| Excessive agency | Safety Gate | approval-required state | approval tests |
| Financial manipulation | Policy / Human Control | amount limits + exact-action approval | transaction tests |
| Replay / stale approval | Session / Human Control | nonce + expiry (roadmap) | planned |
| Supply-chain tool risk | Tool / MCP | manifest/version pinning (roadmap) | planned |
| Memory poisoning | Context | trust-scoped memory (roadmap) | planned |
| Multi-agent cascade | Identity / Policy | per-agent capability isolation (roadmap) | planned |
| Data exfiltration | Data / Execution | DLP + egress policy (roadmap) | planned |
| Audit tampering | Audit | hash-linked evidence chain | tamper test |
| Denial of wallet | Policy / Resource | quotas and budget guard (roadmap) | planned |

## Security invariants

1. No model output directly authorizes a tool.
2. Unknown tools fail closed.
3. High-impact operations become proposals until independently approved.
4. Approval is cryptographically bound to the exact proposed action.
5. External/untrusted provenance cannot authorize privileged action.
6. Audit evidence is tamper-evident through hash chaining.
7. Public tests use synthetic data and do not target external systems.

## Test strategy

The project should maintain both **adversarial** and **benign** cases. A useful security metric is not only detection rate; it also includes unauthorized-action rate, sensitive-data exposure, false positives, approval coverage and evidence integrity.
