# AyorAI Agent Defense Lab

> Open-source adversarial evaluation laboratory for defensive AI agents operating on sensitive-data and financial workflows.

**Red Agent → Sandbox → Blue Agent → Evaluation → Audit**

This lab demonstrates how an AI security control plane can test an agent against controlled adversarial scenarios without connecting to real systems, credentials, customer data, banking infrastructure, or production services.

## Why this project exists

Modern agentic systems can read documents, call tools, retrieve records and make workflow decisions. Security therefore needs more than prompt filtering: it needs policy enforcement, data classification, authorization boundaries, tool controls, observability and repeatable evaluation.

The project is aligned conceptually with the OWASP GenAI Security Project and its work on agentic security and red-team evaluation, and with the NIST AI Risk Management Framework and Generative AI Profile. OWASP explicitly covers risks such as prompt injection, data leakage and agentic-system security; NIST provides a risk-management and evaluation-oriented framework. See `docs/framework-mapping.md`.

## Safety boundary

The Red Agent in this repository is a **simulation engine**. It generates benign adversarial test cases against a local synthetic target. It does not scan networks, exploit third-party systems, execute arbitrary shell commands, bypass real authentication, steal credentials, or interact with external financial infrastructure.

All sensitive and financial records are synthetic.

## Architecture

```text
                         AYORAI AGENT DEFENSE LAB
                                      |
                    +-----------------+-----------------+
                    |                                   |
                RED AGENT                           BLUE AGENT
          adversarial test cases                detection + policy
                    |                                   |
                    +-----------------+-----------------+
                                      |
                                  SANDBOX
                         synthetic financial data
                                      |
                              EVALUATION ENGINE
                                      |
             +----------------+-------+-------+----------------+
             |                |               |                |
          Detection       Containment      Leakage         Auditability
             |                |               |                |
             +----------------+-------+-------+----------------+
                                      |
                                JSON REPORT
```

## Included scenarios

- Prompt injection simulation
- Synthetic sensitive-data exfiltration attempt
- Tool misuse / unauthorized operation
- Authorization-boundary violation
- Financial transaction manipulation simulation
- PII/secret handling test
- Benign traffic to measure false positives

## Security controls

- Data classification: PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED
- Allowlisted tools
- Role-based authorization
- Transaction amount limits
- Human approval requirement for high-risk financial actions
- Output redaction
- Prompt and tool policy checks
- Immutable-style audit events in the local run
- Deterministic test cases for regression testing

## Run locally

Python 3.11+ is recommended.

```bash
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
python -m app.cli
```

The CLI runs the complete Red → Blue → Evaluation pipeline and writes a report to `reports/latest.json`.

For the local dashboard:

```bash
python -m app.api
```

Then open `http://127.0.0.1:8000`.

No external model or API key is required for the baseline benchmark.

## Optional LLM adapter

The architecture intentionally separates the evaluation engine from the model provider. A future adapter can call a local model such as Ollama/LM Studio, but the sandbox policy remains the security boundary. Never place credentials or real business data in test fixtures.

## Example result

```json
{
  "scenario": "financial_transaction_manipulation",
  "risk": "high",
  "detected": true,
  "blocked": true,
  "sensitive_data_exposed": false,
  "requires_human_approval": true
}
```

## Metrics

The evaluator calculates:

- detection rate
- containment rate
- sensitive-data leakage rate
- unauthorized-action rate
- false-positive rate
- human-approval coverage
- average response latency

These metrics are intended for comparative engineering experiments, not certification.

## Repository standards

- No real credentials
- No production endpoints
- No real personal data
- No real financial records
- No offensive automation against external systems
- Synthetic fixtures only
- Reproducible tests
- Security decisions are logged

## License

MIT. See `LICENSE`.
