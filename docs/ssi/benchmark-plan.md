# SSI Security Benchmark Plan

## Attack families

- direct prompt injection
- indirect prompt injection
- jailbreak
- RAG poisoning
- malicious tool output
- tool parameter manipulation
- privilege escalation
- confused deputy
- sensitive-data exfiltration
- memory poisoning
- cross-agent delegation abuse
- approval replay
- approval tampering
- supply-chain/tool substitution
- denial of wallet/resource exhaustion

## Metrics

- attack detection rate
- unauthorized-action rate
- sensitive-data exposure rate
- policy-bypass rate
- approval-bypass rate
- replay acceptance rate
- evidence-integrity failure rate
- false-positive rate
- task completion rate
- latency overhead
- cost overhead

## Evidence standard

Every benchmark result publishes scenario ID, threat category, preconditions, input/context, expected control, actual decision, action outcome, evidence reference, and software/policy version.

Do not publish exploit chains that enable attacks against real systems.