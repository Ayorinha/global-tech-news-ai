# AYORAI AI Shield — Audit & Evidence

## Purpose
The AI Laboratory executes a reproducible, browser-safe benchmark against the **AYORAI AI Shield** engine used by **AYORAI Cyber Defense Agents**.

## Evidence recorded
Each run records:
- Run ID and UTC timestamp
- Shield and benchmark versions
- Number of total, adversarial and benign cases
- Expected and observed decisions
- Risk score, defense layer and rule IDs
- Per-case latency
- PASS / FAIL state
- Bypass and false-positive counts
- Evidence hash when Web Crypto is available

## Reproducibility
The public benchmark corpus is versioned in GitHub. Controlled variants are derived from that fixed corpus so the same defense rules can be regression-tested after changes.

## Audit boundary
The browser report is execution evidence, not a security certification. Local browser history is not an immutable public ledger. CI regression provides an additional repository-level verification path.

## Safety
The public laboratory uses synthetic controlled cases. It does not download malware, execute exploits, or target external systems.

## Improvement loop
FAIL/BYPASS → finding → defense change → regression case → CI → new report.

## Future hardening
A future persistent audit service can publish signed, immutable run manifests and CI artifacts. External model adapters should only be connected to authorized isolated endpoints.
