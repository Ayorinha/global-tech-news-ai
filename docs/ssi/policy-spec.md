# SSI Policy Specification v0

Policies are data. They must be versioned, reviewable and testable.

## Example

```yaml
policy_version: '0.1'
default_decision: BLOCK
roles:
  analyst:
    capabilities: [read_public, read_internal]
  finance_manager:
    capabilities: [read_public, read_internal, create_payment_draft]
tools:
  create_payment_draft:
    risk: HIGH
    max_amount: 10000
    max_confidentiality: INTERNAL
    requires_human_approval: true
provenance:
  minimum_integrity_for_privileged_action: USER
execution:
  unknown_tool: BLOCK
  policy_error: BLOCK
  approval_mismatch: BLOCK
```

## Requirements

Every policy defines: default decision; actor/capability mapping; tool risk; data-flow constraints; provenance requirements; approval requirements; failure behavior; version and owner.

## Lifecycle

`draft -> test -> review -> approve -> deploy -> monitor -> retire`

Policy changes require regression tests before merge.