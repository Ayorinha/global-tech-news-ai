# SSI Information-Flow Security

SSI uses integrity and confidentiality labels as a first-class security boundary.

## Integrity

`SYSTEM_TRUSTED > TRUSTED_INTERNAL > USER > EXTERNAL > UNKNOWN`

Lower-integrity content must never silently acquire higher authority.

## Confidentiality

`PUBLIC < INTERNAL < CONFIDENTIAL < RESTRICTED`

A destination/tool declares the maximum confidentiality it can receive.

## Propagation

When an operation consumes lower-integrity or higher-confidentiality content, the resulting security state retains the stricter state.

Example: `USER + EXTERNAL + CONFIDENTIAL -> integrity EXTERNAL, confidentiality CONFIDENTIAL`.

The model cannot downgrade these labels.

## Prompt injection

Instructions contained in EXTERNAL or UNKNOWN content are treated as data, not authorization.

## Exfiltration

A destination must reject data whose confidentiality exceeds its declared maximum.

## Design rationale

Current Microsoft Agent Framework security work uses integrity/confidentiality labels and policy enforcement across tool calls to address prompt injection and data exfiltration. SSI adopts the same class of security boundary as an independent implementation target.