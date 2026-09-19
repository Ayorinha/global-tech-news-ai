# AYORAI AI Shield — Testing & Evaluation Strategy

## Testing pyramid

~~~text
                         Independent Evaluation
                                ▲
                       Red / Purple Team
                                ▲
                    System / Integration Tests
                                ▲
                     Component Security Tests
                                ▲
                         Unit Tests
                                ▲
                    Deterministic Test Corpus
~~~

## Required test families

### Functional
Verify expected behavior under supported configurations.

### Security
Verify detection, prevention, isolation, authorization and evidence controls.

### Negative
Verify safe behavior when inputs, policies, updates, services or dependencies fail.

### Performance
Measure CPU, memory, disk, network and battery impact.

### Privacy
Verify data minimization, retention and transmission rules.

### Update
Test signature validation, interrupted updates, rollback and version compatibility.

### Platform
Run equivalent security intent through each native adapter and document differences.

### AI security
Use controlled synthetic cases for prompt injection, RAG poisoning, tool abuse, sensitive-information disclosure, excessive agency and agent-to-agent trust.

### Adversarial evaluation
Use authorized isolated environments only. Do not target external systems.

## Evaluation record

Every meaningful evaluation should capture:
- test ID;
- product version;
- platform;
- configuration;
- corpus/version;
- expected result;
- observed result;
- evidence artifact;
- timestamp;
- reviewer;
- disposition.

## Metrics

Primary:
- detection rate;
- false-positive rate;
- containment latency;
- recovery success;
- evidence completeness.

Secondary:
- CPU/memory overhead;
- battery impact;
- update latency;
- rollback reliability;
- alert precision;
- platform coverage;
- repeat-exposure reduction.

## Evidence rule

Never convert an internal benchmark into a claim about real-world protection without an appropriate external methodology and scope.

## Release gate

A high-impact control requires:
**functional tests + security tests + negative tests + performance tests + rollback test + evidence review**.
