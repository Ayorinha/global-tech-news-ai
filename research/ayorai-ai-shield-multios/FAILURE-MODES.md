# AYORAI AI Shield — Failure Modes & Risk Register

Security products can fail in ways that create new risk. This register is a design gate for the future platform.

| Area | Failure mode | Required control |
|---|---|---|
| Agent | crash or deadlock | watchdog, health state, safe recovery |
| UI | interface closes | security service remains independent |
| Policy | corrupt policy | schema validation, signed policy, last-known-good |
| Update | malicious/partial update | signature, provenance, staged rollout, rollback |
| Cloud | control plane unavailable | offline-safe local policy |
| AI | unsafe recommendation | no autonomous privileged action |
| AI | hallucinated evidence | provenance and evidence verification |
| Detection | false positive | explainable, reversible action, review path |
| Detection | missed threat | telemetry expansion, regression case |
| Storage | evidence disk full | quotas, backpressure, protected critical evidence |
| Time | incorrect system clock | monotonic timing where possible, anomaly detection |
| Network | hostile/intermittent network | fail-safe policy and bounded retries |
| Privilege | privilege escalation | least privilege and explicit authorization |
| Tamper | local agent modification | integrity checks and platform-native protection |
| Supply chain | compromised dependency | SBOM, provenance, scanning, controlled upgrades |
| Privacy | excessive telemetry | minimization, local processing, explicit controls |
| Isolation | failed quarantine | verification of isolation state |
| Recovery | rollback fails | tested recovery package/path |
| Multi-tenant | data crossing tenants | hard isolation and authorization tests |
| Mobile | OS API restriction | capability discovery and platform-specific design |
| Kernel/system | unstable native integration | staged rollout and independent adapter |
| Ransomware | destructive activity too fast | early behavioral signals and safe containment |
| Data | sensitive data exposed | data classification and outbound controls |
| Evidence | altered logs | integrity metadata and protected storage |
| Operator | unsafe approval | separation of duties and approval policy |

## Release gate

No high-impact control should ship until its failure mode is:
1. identified;
2. tested;
3. documented;
4. observable;
5. recoverable where possible;
6. assigned to an owner.

## AI-specific hard rule

The AI layer may:
- analyze;
- correlate;
- propose;
- classify;
- generate synthetic tests;
- recommend actions.

The AI layer must not, without an explicit controlled authorization boundary:
- grant itself privileges;
- disable security controls;
- erase evidence;
- modify production policy;
- deploy arbitrary executable code;
- bypass approval;
- change its own security boundaries.

## Zero-trust assumption

Every component should be treated as potentially faulty or compromised. Trust must be established through identity, authorization, integrity, provenance, policy and evidence.
