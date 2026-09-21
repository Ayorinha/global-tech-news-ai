# SSI Validation Cycles

## Purpose

SSI is validated through repeated adversarial and regression passes rather than a single happy-path test.

The first hardened validation run executes **50 deterministic cycles** against the public reference control plane.

Each cycle checks:

1. direct prompt-injection handling;
2. untrusted provenance cannot authorize a financial action;
3. high-impact actions stop at the approval boundary;
4. approval is bound to the exact action digest;
5. approval replay is rejected;
6. the audit chain remains internally verifiable.

The test suite also exercises the MCP/tool boundary with role, amount and data-classification matrices.

## What this proves

The run demonstrates that the implemented deterministic controls behave according to the tested invariants for the covered synthetic scenarios.

It does **not** prove protection against all attackers, all model families, all tool implementations or all production environments.

## Continuous loop

```text
Research
  ↓
Threat model
  ↓
Architecture review
  ↓
Implementation
  ↓
Adversarial validation
  ↓
Failure analysis
  ↓
Correction
  ↓
Regression validation
  ↓
New research
  ↓
Next validation cycle
```

The cycle count is evidence of repeated validation, not a security certification.