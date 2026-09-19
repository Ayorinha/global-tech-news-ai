# AYORAI AI Shield — Product Requirements

## Product objective

Build a future security platform that can be downloaded and deployed across supported operating systems and workloads, while keeping protection, evidence, privacy, recovery and auditability as first-class requirements.

## Core requirements

| ID | Requirement | Acceptance principle |
|---|---|---|
| PR-001 | Native endpoint service | Protection does not depend on UI |
| PR-002 | Explicit permissions | Minimum required privileges only |
| PR-003 | Cross-platform core | Portable decisions and evidence |
| PR-004 | Native enforcement | OS-specific controls through adapters |
| PR-005 | Offline safety | Local policy remains available during outage |
| PR-006 | Signed updates | Integrity and provenance verified before install |
| PR-007 | Rollback | Known-good state can be restored |
| PR-008 | Evidence | Material decisions produce auditable records |
| PR-009 | Privacy | Data collection is minimized and documented |
| PR-010 | AI safety | AI cannot bypass security governance |
| PR-011 | Multi-signal detection | Correlate endpoint, identity, network and application evidence |
| PR-012 | Isolation | High-risk actions can be contained safely |
| PR-013 | Mobile | Separate Android/iOS capability models |
| PR-014 | High assurance | Stronger controls for regulated environments |
| PR-015 | Independent testing | Product claims can be externally evaluated |
| PR-016 | Vulnerability disclosure | External researchers have a defined reporting path |
| PR-017 | Supply-chain security | Dependencies, builds and artifacts are governed |
| PR-018 | Recovery | False positives and failed updates have recovery paths |

## User experience

The future desktop product should provide:
- installer appropriate to the OS;
- first-run security and privacy explanation;
- permission request with purpose;
- protection status;
- alert explanation;
- quarantine/isolation status;
- recent security events;
- diagnostics;
- update status;
- evidence export where permitted.

The UI must never imply that absence of an alert means absence of risk.

## Enterprise experience

The future management plane should provide:
- device inventory;
- policy state;
- security posture;
- incidents;
- evidence;
- update rings;
- approval workflows;
- role separation;
- audit trail;
- tenant isolation.

## High-assurance experience

Profiles may add:
- private management plane;
- customer-controlled keys;
- restricted outbound communication;
- offline/air-gapped operation;
- delayed customer-approved updates;
- immutable evidence export;
- dual authorization;
- separation of duties.

These are future requirements, not current capabilities.
