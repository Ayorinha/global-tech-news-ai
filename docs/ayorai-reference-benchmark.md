# AYORAI Reference Cybersecurity Benchmark

## Purpose

The public AYORAI AI Shield laboratory contains a real, executable defensive engine and a reference-aligned security benchmark. The engine runs actual detection logic; the benchmark scenarios are safe, synthetic and controlled. The project does not claim certification and does not reproduce live exploits. Official or recognized external references are used as evaluation foundations, while the benchmark implementation and observed results belong to AYORAI.

## Reference foundations

- **OWASP GenAI LLM Top 10 2026** — Current GenAI/LLM application risks and 2026 categories.
- **MITRE ATLAS** — adversarial tactics and techniques for AI systems.
- **NIST AI 100-2e2025** — adversarial machine-learning taxonomy and terminology.
- **OASB** — external agent-security benchmark used as a technique-coverage reference; its scenarios are not copied into the public lab.

## Measurement

For each case the lab records:

- reference and technique/category
- adversarial vs benign classification
- expected defensive posture
- observed AYORAI AI Shield decision
- detection/bypass
- false positive
- rule IDs and defense layer
- execution time
- benchmark run ID

A **bypass** means an adversarial synthetic case was classified as ALLOW. A **false positive** means a benign control was classified as BLOCK.

## Important boundary

This is an AYORAI evaluation benchmark, not an official OWASP, MITRE ATLAS, NIST, or OASB test or certification. The external references are used as documented foundations; the Shield engine, benchmark implementation, synthetic cases, and observed results are AYORAI's. It does not claim that AYORAI AI Shield covers all techniques. Coverage is measured empirically and gaps are intentionally visible.

The benchmark is safe by design: it does not download malware, execute exploits, attack external systems, or perform unauthorized tool actions.

## Why this matters

The benchmark makes the lab traceable to established security taxonomies instead of relying only on an internally invented test corpus. Future iterations can add new reference mappings and improve the shield rules based on measured bypasses.


## Automated publication

Reference intelligence is checked every hour by GitHub Actions. Public source metadata is fetched and hashed, then selected MITRE ATLAS techniques are converted into synthetic, non-executable defensive cases for AYORAI AI SHIELD. The repository publishes the latest evidence only when the material reference or defensive state changes. The public laboratory reads `audit/reference-runs/latest-public.json` for provenance and current published findings.
