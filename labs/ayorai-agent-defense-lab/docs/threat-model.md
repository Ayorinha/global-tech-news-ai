# Threat Model — AyorAI Agent Defense Lab

## Scope
Synthetic enterprise and financial workflows only. The lab evaluates defensive controls around AI agents without touching external systems.

## Assets
- Synthetic customer records
- Synthetic account balances
- Synthetic transaction instructions
- Agent prompts and outputs
- Tool authorization state
- Audit events

## Threats tested
| Threat | Example | Expected control |
|---|---|---|
| Prompt injection | instruction override | input policy + block |
| Sensitive-data leakage | CPF/credential request | classification + redaction |
| Privilege escalation | analyst requests finance tool | RBAC allowlist |
| Financial abuse | oversized payment draft | amount threshold + approval |
| Audit tampering | attempt to disable logging | immutable audit event design |
| False positive | benign financial question | transparent detection metrics |

## Security boundary
The Red Agent is a test-case generator/simulator. It does not scan, exploit, persist, exfiltrate, or execute arbitrary commands against real systems.

## Success criteria
A benchmark should make detection, containment, leakage, authorization, approval and false-positive behavior measurable and reproducible.
