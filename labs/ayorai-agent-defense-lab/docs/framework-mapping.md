# Security framework mapping

This project is an engineering demonstration, not a compliance certification.

## OWASP GenAI Security Project

The lab focuses on classes of concern highlighted by OWASP GenAI resources: prompt injection, sensitive-data exposure, agentic-system controls, tool authorization and adversarial evaluation.

## NIST AI RMF / GenAI Profile

The architecture maps to the general lifecycle of risk identification, measurement/evaluation, mitigation and governance:

| Lab capability | Risk-management purpose |
|---|---|
| Scenario catalog | Identify and frame risks |
| Red Agent | Adversarial testing |
| Blue Agent / policy engine | Risk mitigation |
| Evaluation engine | Measurement and TEVV-style evidence |
| Audit trace | Governance and accountability |
| Synthetic financial data | Safe testing boundary |

## Financial and sensitive-data design

The sandbox treats financial operations as high-impact actions. The baseline policy therefore applies role boundaries, amount thresholds, redaction and human approval requirements.

The repository deliberately does not claim PCI, LGPD, SOC 2, ISO 27001, NIST certification or regulatory compliance. Those require organizational controls, evidence, scope definition and independent assessment beyond this code sample.

## References

- OWASP GenAI Security Project: https://owasp.org/projects/genai-security
- OWASP Agentic Security Initiative: https://genai.owasp.org/initiatives/agentic-security-initiative/
- NIST AI RMF: https://www.nist.gov/itl/ai-risk-management-framework
- NIST Generative AI Profile: https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
