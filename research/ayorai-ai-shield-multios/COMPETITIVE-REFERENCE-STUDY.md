# AYORAI AI Shield — Competitive Reference Study

This document records capabilities observed in leading cybersecurity platforms and converts them into research requirements for AYORAI. It does not claim that AYORAI currently matches or exceeds these products.

## Reference platforms

### Microsoft Defender XDR

Microsoft documents a unified pre- and post-breach defense model spanning endpoints, identities, email, applications and cloud services, with detection, investigation and response coordinated across those surfaces.

**Research lesson:** security signals should be correlated across domains rather than isolated in separate products.

### CrowdStrike Falcon

CrowdStrike describes a unified platform covering endpoint, identity, cloud, SaaS and AI security, with AI-native investigation and automated response.

**Research lesson:** endpoint protection should evolve into a broader security platform with a shared data and response layer.

### Palo Alto Networks Cortex XSIAM

Cortex XSIAM presents endpoint, network, identity, cloud, exposure, email and security operations capabilities on a unified platform.

**Research lesson:** combine prevention, detection, exposure management, data correlation and response.

### SentinelOne Singularity

SentinelOne describes behavioral AI, autonomous containment, endpoint/identity correlation, cloud and AI security, and a unified XDR data layer.

**Research lesson:** behavior and identity signals should participate in the same incident model.

### ESET PROTECT

ESET documents coverage for endpoints, servers, mobile devices, cloud applications, cloud workloads, email, vulnerability and patch management, XDR, MFA, threat intelligence and MDR.

**Research lesson:** customer environments are heterogeneous, so the platform needs modular coverage and centralized policy.

## AYORAI research differentiation

The research should investigate several capabilities as first-class architectural concepts:

1. **Cross-platform native enforcement** rather than a browser-only security experience.
2. **AI-native security** covering LLM, RAG, agents and AI-generated attacks.
3. **Controlled adaptive defense** with explicit gates between AI recommendations and production changes.
4. **Threat-informed continuous testing** connected to the existing AYORAI benchmark methodology.
5. **Evidence-first architecture** where every important security decision is explainable and auditable.
6. **High-assurance profiles** for financial and other regulated environments.
7. **Offline-safe endpoint operation** when the cloud control plane is unavailable.
8. **Independent update trains** so threat intelligence can move faster than native agent releases.
9. **Portable policy + native adapters** so one security model can cover different operating systems without pretending their security primitives are identical.
10. **A future consumer-to-enterprise path** where the same security foundation can serve an individual endpoint, a business fleet or a high-assurance deployment.

## Reference links

- Microsoft Defender XDR: https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender
- CrowdStrike Falcon Platform: https://www.crowdstrike.com/platform/
- Palo Alto Cortex XSIAM: https://www.paloaltonetworks.com/cortex/cortex-xsiam
- SentinelOne Singularity Platform: https://www.sentinelone.com/platform/
- ESET PROTECT Platform: https://www.eset.com/us/business/protect-platform/

## Research boundary

"Better" should be treated as an engineering objective to investigate, not a present factual claim.

The project should benchmark measurable properties such as:
- detection coverage;
- false-positive behavior;
- containment latency;
- resource overhead;
- update latency;
- rollback reliability;
- platform coverage;
- evidence completeness;
- resilience under controlled adversarial testing;
- safe AI-assisted response quality.
