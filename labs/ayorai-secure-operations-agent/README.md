# AyorAI Secure Operations Agent

A human-in-the-loop agent for safe document, knowledge and operations assistance in regulated environments.

## Architecture

User -> Planner -> Local Knowledge/RAG -> Tool Policy -> Safety Gate -> Human Approval -> Action Plan -> Audit Trail

The default implementation is deterministic and local. It does not send emails, modify external systems, access credentials, or execute arbitrary commands.

## What it demonstrates

- Agentic task planning
- Local retrieval over a small knowledge base
- Tool authorization and least privilege
- Risk classification
- Human-in-the-loop approval
- Structured action proposals
- Audit evidence
- Deterministic tests suitable for CI
- Separation between reasoning, policy and execution

## Example

Input: "Encontre a política de arquivos NSA e prepare um checklist para validar um retorno."

The agent retrieves relevant local knowledge, creates a checklist, and returns a proposed action. It does not execute the action automatically.

## Safety model

| Risk | Default behavior |
|---|---|
| Read-only knowledge retrieval | Allow |
| Generate analysis/checklist | Allow |
| Prepare an external action | Require approval |
| Execute external action | Block in this lab |
| Credentials/secrets | Block |
| Arbitrary shell/network execution | Block |

## Run

Install dependencies with: pip install -r requirements.txt

Run: python -m app.cli "prepare an NSA validation checklist"

Test: pytest -q

## Relationship to AyorAI Agent Defense Lab

The existing Agent Defense Lab evaluates defensive agents adversarially. This lab demonstrates how those controls can sit in front of a useful operational agent.

Research scope only: synthetic/public-safe data and no external targets.
