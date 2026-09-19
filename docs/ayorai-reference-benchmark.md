# AYORAI Reference Cybersecurity Benchmark

## Purpose

The public AYORAI AI Shield laboratory now includes a reference-aligned security benchmark. The benchmark does not claim certification or reproduce live exploits. It uses safe synthetic cases mapped to recognized security references and measures the observed defensive coverage of the current shield.

## Reference foundations

- **OWASP Top 10 for LLM Applications 2025** — GenAI/LLM application risks.
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

This is an evaluation benchmark, not a claim that AYORAI AI Shield covers all OWASP, MITRE ATLAS, NIST, or OASB techniques. Coverage is measured empirically and gaps are intentionally visible.

The benchmark is safe by design: it does not download malware, execute exploits, attack external systems, or perform unauthorized tool actions.

## Why this matters

The benchmark makes the lab traceable to established security taxonomies instead of relying only on an internally invented test corpus. Future iterations can add new reference mappings and improve the shield rules based on measured bypasses.
