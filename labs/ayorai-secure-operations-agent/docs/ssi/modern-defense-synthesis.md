# AYORAI SSI — Modern AI Defense Synthesis

## Why the Pix principle is not enough

Pix is useful as a reference for a **transaction security model**: a request is structured,
authenticated, validated and processed inside a governed participant infrastructure.
SSI keeps that principle but applies it to a different asset: **authority over data and
agent actions**.

The security objective is not to make an AI model impossible to manipulate. It is to
make successful manipulation insufficient to obtain unauthorized authority.

## Research concepts incorporated

### 1. Capability security — CaMeL

CaMeL (2025) places a protective layer around the LLM, separates trusted control flow
from untrusted data flow, and uses capabilities to constrain data exfiltration. SSI
implements the same family of principle through transaction-bound capabilities,
fail-closed reconciliation and the Sovereign Data Cell.

Reference: Debenedetti et al., "Defeating Prompt Injections by Design".

### 2. Information-flow control — Fides / IFC

Microsoft Research's Fides tracks confidentiality and integrity labels and enforces
information-flow policies deterministically. SSI already has an information-flow layer;
the next integration step is to bind those labels directly to SecurityTransaction and
tool/capsule release decisions.

### 3. Goal / task alignment — Task Shield

Task Shield evaluates whether instructions and tool calls contribute to the user's
declared task. SSI should therefore bind a transaction not only to a permission, but
also to an **intent contract** and allowed action graph.

### 4. Trajectory-based detection — MELON

MELON compares agent behavior under modified prompts to detect indirect prompt
injection. This is complementary to SSI: cryptographic authorization protects the
execution boundary, while trajectory analysis detects suspicious changes in the
reasoning/action path before execution.

### 5. Adaptive red teaming

NIST and Google DeepMind emphasize that static attack suites are insufficient because
attackers adapt to defenses. SSI therefore needs a continuously evolving benchmark,
with attack mutation, task-specific metrics and regression evidence rather than a
single fixed prompt-injection test set.

### 6. Instruction hierarchy

Recent work from OpenAI strengthens the model's ability to distinguish trusted
instructions from lower-trust tool or external content. SSI treats this as a
**model-layer defense**, never as the final authorization boundary.

### 7. Defense-in-depth and verified behavior

Microsoft and Google DeepMind describe layered defenses, plan-drift detection,
critic/auditor components, tool-chain analysis, least privilege and progressively
controlled permissions. SSI maps these to separate deterministic control points.

## Proposed SSI Defense Mesh

```
                 UNTRUSTED WORLD
                       |
                       v
              +------------------+
              | Input / Content   |
              | Provenance Label  |
              +---------+--------+
                        |
                        v
              +------------------+
              | Intent Contract   |
              | Task / Goal Hash   |
              +---------+--------+
                        |
                        v
              +------------------+
              | AI / Planner      |
              | MODEL PROPOSES   |
              +---------+--------+
                        |
              +---------+----------+
              |                    |
              v                    v
       Plan/Task Shield       Trajectory Guard
       "does this help?"     "did behavior drift?"
              |                    |
              +---------+----------+
                        |
                        v
              +------------------+
              | SSI Transaction  |
              | operation/resource|
              | purpose/context   |
              +---------+--------+
                        |
             +----------+----------+
             |                     |
             v                     v
      Semantic Defense      Capability Defense
      policy/IFC/risk       cryptographic scope
             |                     |
             +----------+----------+
                        |
                        v
                  RECONCILER
                 /          \
            AGREEMENT       CONFLICT
               |                |
               v                v
            EXECUTE          QUARANTINE
               |
               v
        SOVEREIGN DATA CELL
               |
               v
       ENCRYPTED CAPSULE
               |
               v
       ONE-TIME Q CAPABILITY
```

## What this adds beyond the Pix analogy

| Property | Transaction-security principle | SSI extension |
|---|---|---|
| Request integrity | Structured transaction | Canonical transaction hash |
| Authentication | Strong requester identity | Agent identity + scoped capability |
| Authorization | Policy | Policy + capability + IFC |
| Intent | Transaction purpose | Intent contract / goal binding |
| AI manipulation | Not applicable | Task/trajectory defenses |
| Data leakage | Financial transaction controls | Information-flow labels + sealed capsule |
| Replay | Transaction controls | Nonce, TTL, single-use reveal capability |
| Compromised component | Participant controls | Independent defenses + reconciliation |
| Recovery | Operational controls | Quarantine + controlled recovery |
| Evaluation | Operational monitoring | Adaptive adversarial regression |

## Priority implementation order

1. **P0 — CI integrity:** zero known dependency vulnerabilities.
2. **P0 — Transaction binding:** operation, resource, purpose, provenance, context and
   capability must bind to one transaction root.
3. **P1 — IFC integration:** SecurityTransaction carries confidentiality/integrity
   labels and release decisions enforce them.
4. **P1 — Intent Contract:** model output cannot introduce a new objective or tool
   sequence outside the declared task.
5. **P1 — Tool-chain guard:** deny dangerous sequences even when individual tools are
   individually permitted.
6. **P1 — Trajectory drift:** detect deviations from the approved task/action graph.
7. **P2 — Adaptive red team:** mutation-based prompt injection and multi-agent attack
   suites with reproducible evidence.
8. **P2 — Progressive trust:** privileges expand only after independently verified
   behavior; anomalies reduce or revoke privileges.
9. **P2 — Durable evidence:** signed/tamper-evident evidence ledger with versioned
   policy and artifact identity.
10. **P3 — Hardware-backed boundary:** TEE/HSM/secure boot profile for a future
    enterprise deployment.

## Non-negotiable principle

> **The model may propose an action. It must never manufacture the authority to perform it.**

The security transaction is the bridge between AI intent and deterministic execution.
