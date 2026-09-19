# AYORAI AI Shield — Threat Model

## Scope

This threat model covers the future platform, not the current browser laboratory.

## Assets

- endpoint security state;
- security policies;
- device identity;
- credentials and tokens;
- customer data;
- telemetry;
- evidence;
- update packages;
- detection rules;
- AI models and prompts;
- threat intelligence;
- management-plane credentials;
- signing keys.

## Trust boundaries

1. Endpoint ↔ local UI
2. Endpoint ↔ native OS APIs
3. Endpoint ↔ control plane
4. Control plane ↔ tenant
5. Update service ↔ endpoint
6. Intelligence source ↔ normalization pipeline
7. AI analysis ↔ enforcement layer
8. Evidence store ↔ operator
9. Build system ↔ release artifact
10. Mobile application ↔ platform security APIs

## Threat categories

### Endpoint compromise
An attacker attempts to disable, tamper with or bypass the agent.

Controls:
- least privilege;
- integrity checks;
- protected service lifecycle;
- platform-native security mechanisms;
- tamper evidence;
- recovery path.

### Supply-chain compromise
A dependency, build, signing process or update channel is compromised.

Controls:
- SBOM;
- dependency governance;
- provenance;
- signed artifacts;
- staged rollout;
- independent verification;
- rollback.

### Control-plane compromise
An attacker attempts to abuse centralized management.

Controls:
- strong identity;
- tenant isolation;
- least privilege;
- role separation;
- approval workflows;
- immutable audit evidence;
- offline-safe endpoint behavior.

### AI compromise
An attacker attempts to manipulate AI analysis through prompts, retrieved content, tools or poisoned knowledge.

Controls:
- untrusted-input separation;
- policy enforcement outside the model;
- tool authorization;
- provenance;
- synthetic regression cases;
- no unrestricted production self-modification.

### Evidence compromise
An attacker attempts to alter or delete security records.

Controls:
- integrity metadata;
- protected storage;
- append-oriented evidence design;
- restricted deletion;
- export and independent retention options.

### False-positive harm
The system blocks legitimate software, files, users or network actions.

Controls:
- confidence thresholds;
- explainable reason codes;
- reversible actions;
- operator review;
- allowlist governance;
- regression testing.

### Availability failure
Security software itself destabilizes the host.

Controls:
- resource limits;
- watchdogs;
- staged rollout;
- safe mode;
- recovery package;
- independent adapter isolation.

## Threat-model rule

Every new high-impact capability must update this document before production enforcement is considered.
