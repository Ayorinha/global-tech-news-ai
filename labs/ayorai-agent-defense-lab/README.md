# AyorAI Agent Defense Lab

> Open-source adversarial evaluation laboratory for defensive AI agents operating on sensitive-data and financial workflows.

**Red Agent → Policy Boundary → Synthetic Financial Sandbox → Blue Agent → Evaluation → Audit**

## What is connected in practice

This is now an executable local security lab, not only documentation. The flow is wired end-to-end:

1. **Red Agent / scenarios** supplies controlled adversarial and benign cases.
2. **Policy Boundary** classifies data, detects injection indicators, enforces RBAC, tool allowlists, financial thresholds and human-approval rules.
3. **Synthetic Financial Sandbox** provides fake accounts and a local ledger; no real banking or customer system is contacted.
4. **Blue Agent** is the defensive baseline. A pluggable local-LLM adapter is included for OpenAI-compatible localhost endpoints such as Ollama/LM Studio.
5. **Evaluation Engine** measures detection, containment, leakage, authorization and score.
6. **Audit Log** records evaluation events with SHA-256 event hashes.
7. **FastAPI + Dashboard** exposes `/health`, `/scenarios`, `/benchmark`, `/arena` and `/audit` for local operation.
8. **Docker/Compose** provides a repeatable local runtime with read-only filesystem and `no-new-privileges`.
9. **GitHub Actions** runs regression tests automatically.

**No external model or API key is required for the baseline.**

## Safety boundary

The Red Agent is a **simulation engine**, not an offensive exploitation framework. It does not scan networks, exploit third-party systems, execute arbitrary shell commands, bypass real authentication, steal credentials, or interact with external financial infrastructure.

All sensitive and financial records are synthetic.

## Architecture

```text
                     AYORAI AGENT DEFENSE LAB
                              |
                +-------------+-------------+
                |                           |
            RED AGENT                   BLUE AGENT
        controlled attacks             defensive model
                |                           |
                +-------------+-------------+
                              |
                       POLICY BOUNDARY
                 classification + RBAC + tools
                              |
                  SYNTHETIC FINANCIAL SANDBOX
                    accounts + local ledger
                              |
                    EVALUATION ENGINE
                              |
                 +------------+------------+
                 |            |            |
             Detection   Containment    Leakage
                 |            |            |
                 +------------+------------+
                              |
                         AUDIT LOG
                              |
                       JSON / DASHBOARD
```

## Scenarios

- Prompt injection simulation
- Synthetic sensitive-data exfiltration attempt
- Unauthorized tool request
- Authorization-boundary violation
- Financial transaction manipulation simulation
- PII/credential handling
- Benign financial traffic for false-positive measurement

## Controls

- PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED classification
- Role-based tool authorization
- Allowlisted tools
- Transaction amount limits
- Human approval for high-risk financial actions
- Output redaction
- Prompt/tool policy checks
- Synthetic account and ledger state
- Hash-linked audit event records
- Deterministic regression tests

## Local operation

```bash
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python -m app.cli
python -m app.api
```

Open `http://127.0.0.1:8000`.

### Docker

```bash
docker compose up --build
```

The dashboard provides buttons for **Run benchmark**, **Run Agent Arena**, and **View audit + ledger**.

## API

| Endpoint | Purpose |
|---|---|
| `GET /health` | Security boundary status |
| `GET /scenarios` | Synthetic scenario catalog |
| `POST /benchmark` | Full benchmark + metrics |
| `POST /arena` | End-to-end agent evaluation |
| `GET /audit` | Audit events + synthetic ledger snapshot |

## Local LLM integration

`app/agent.py` includes a localhost OpenAI-compatible adapter. It can call a local model endpoint, but **the model never receives permission to execute tools directly**. The policy engine remains the authorization boundary.

This separation is intentional for sensitive-data and financial workflows: model output is untrusted input until policy checks pass.

## Metrics

- Detection rate
- Containment rate
- Sensitive-data leakage rate
- Unauthorized-action rate
- Human-approval coverage
- False positives
- Average score

These are engineering evaluation metrics, not compliance certification.

## Security framework mapping

See `docs/framework-mapping.md` and `docs/threat-model.md` for the conceptual mapping to OWASP GenAI/agentic security work and the NIST AI Risk Management Framework.

## Important boundary

This repository does **not** claim LGPD, PCI DSS, ISO 27001, SOC 2, or NIST certification. It demonstrates technical controls and a repeatable testing methodology that can be adapted to regulated environments.

## Repository standards

- Synthetic data only
- No secrets or credentials
- No production endpoints
- No real personal data
- No real financial records
- No offensive automation against external systems
- Reproducible tests
- Auditable security decisions

## License

MIT. See `LICENSE`.
