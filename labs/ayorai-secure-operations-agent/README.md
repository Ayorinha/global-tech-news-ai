# AYORAI · GREAT ATTRACTOR

> **Agentic Intelligence & AI Safety Platform**
>
> *Where Agents, Knowledge and Safety Converge.*

Great Attractor is the orchestration layer that connects AYORAI's existing AI Safety, research and defensive-agent capabilities into a single agentic architecture.

It is **not a replacement** for AI Shield or AI Laboratory. It is the coordination layer above them.

## Architecture

```
                         AYORAI · GREAT ATTRACTOR
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
         AI Shield          AI Laboratory       Agent Defense
          Defense              Research             Evaluation
             │                    │                    │
             └────────────────────┼────────────────────┘
                                  │
                           GREAT ATTRACTOR
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                RAG              MCP            Policy
                 │                │                │
                 └────────────────┼────────────────┘
                                  │
                           Safety Gate
                                  │
                        Human-in-the-loop
                                  │
                          Proposed Action
                                  │
                              Audit Log
```

## What it does

The current implementation is a deterministic, local secure-agent foundation. It demonstrates how an operational agent can consume knowledge while remaining behind explicit policy and human-approval boundaries.

- Local RAG / knowledge retrieval
- Agent task orchestration
- Least-privilege policy evaluation
- Sensitive-request blocking
- Human approval for external actions
- Proposed actions instead of uncontrolled execution
- Structured audit evidence
- Deterministic tests and CI validation

## How the existing AYORAI projects fit

| Layer | AYORAI capability | Role |
|---|---|---|
| Research | **AI Laboratory** | Threat research, benchmarks and controlled evaluation |
| Defense | **AI Shield** | Defensive boundaries and security controls |
| Evaluation | **Agent Defense Lab** | Adversarial testing of defensive agents |
| Orchestration | **Great Attractor** | Connects knowledge, policy, agents and safety |
| Operations | **Secure Operations Agent** | First practical agent implementation |

The existing projects remain independently testable. Great Attractor provides the architectural relationship between them.

## Safety boundary

This public lab is intentionally safe and local. It does not send email, access credentials, execute arbitrary shell commands, modify production systems or target external systems.

High-impact external actions require human approval in the architecture and are not executed by this public implementation.

## Current workflow

```
User Request
    ↓
Agent
    ↓
Local RAG
    ↓
Policy Engine
    ↓
Safety Gate
    ↓
Human Approval
    ↓
Proposed Action
    ↓
Audit
```

## Roadmap

1. Model adapter behind the existing policy boundary
2. MCP tool registry with explicit allowlists
3. Multi-agent routing with isolated permissions
4. Provenance and evidence ledger
5. Continuous AI Safety evaluation
6. Human approval workflows for high-impact operations

The roadmap does not grant the model direct authority. Policy remains the authorization boundary.

## Run

```bash
pip install -r requirements.txt
python -m app.cli "prepare an NSA validation checklist"
pytest -q
```

## Relationship to the AI Safety stack

Great Attractor is the **coordination concept**. AI Shield remains the defensive layer; AI Laboratory remains the research/evaluation surface; Agent Defense Lab remains the executable adversarial evaluation environment.

**Research → Defense → Evaluation → Orchestration → Controlled Action → Audit**
