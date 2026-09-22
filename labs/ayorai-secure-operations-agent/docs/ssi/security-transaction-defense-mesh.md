# SSI Security Transaction Defense Mesh

## Purpose

This lab implements a Pix-inspired **security transaction** pattern for AI agents.
It does not copy Pix internals and does not claim stronger real-world security than
Pix. The objective is to test a different security property:

> Compromise of one decision component must not, by itself, create authority over a protected resource.

## Flow

```
AI REQUEST
    |
    v
SecurityTransaction
    |
    +--------------------+
    |                    |
    v                    v
SemanticDefense     CapabilityDefense
    |                    |
    +---------+----------+
              v
          Reconciler
          /        \
     EXECUTE    QUARANTINE
        |
        v
SovereignDataCell
        |
        v
Encrypted ResponseCapsule
        |
        v
One-time Q RevealCapability
```

## Security properties tested

1. **Transaction binding** — capabilities are bound to the exact transaction hash.
2. **Dual decision** — semantic and cryptographic defenses must both allow.
3. **Fail-closed reconciliation** — disagreement produces `QUARANTINE`.
4. **Provenance resistance** — external provenance cannot become authorization.
5. **Replay resistance** — reveal capabilities are single-use.
6. **Capability binding** — a Q capability cannot reveal another capsule.
7. **Data locality** — the Sovereign Data Cell keeps its record store local and emits only a sealed result.
8. **Authenticated encryption** — AES-GCM protects response confidentiality and integrity.

## Important boundary

This is a research/reference implementation, not a production security module.
It does not provide an HSM, TEE, secure boot, hardware isolation, distributed trust,
formal verification, or regulatory certification. The in-memory key and data store are
deliberately simple so the security properties can be tested deterministically.

## Why this differs from a normal authorization check

A conventional flow can accidentally become:

```
credential -> permission -> action
```

SSI makes the authorization decision transaction-specific:

```
identity + operation + resource + purpose + context + capability + policy + nonce + TTL
    -> two independent decisions
    -> reconciliation
    -> controlled execution
```

The model is therefore treated as a proposer/interpreter, not as the authority.
