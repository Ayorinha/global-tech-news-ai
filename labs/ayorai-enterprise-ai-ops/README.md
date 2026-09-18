# AYORAI Enterprise AI Operations

> Agentic enterprise automation combining RAG, MCP, RPA, Document Intelligence and AI Safety.

AYORAI Enterprise AI Operations is a local-first engineering lab for intelligent operational workflows. It separates knowledge retrieval, tool execution, browser automation and safety controls so model output is treated as untrusted input until policy validation succeeds.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the visual system architecture and trust boundaries.

Engineering flow:

Request → Agent Routing → RAG Retrieval → MCP Tool Selection → Safety Policy → RPA/DB Execution → Validation → Audit

## Technology

- Python 3.11+
- FastAPI
- Pydantic
- RAG retrieval boundary
- MCP-compatible tool boundary
- Playwright RPA integration point
- OCR / Document Intelligence integration point
- RBAC, allowlists, risk thresholds and human approval
- Pytest
- Docker
- GitHub Actions

## Repository layout

labs/ayorai-enterprise-ai-ops/
- app/ — API, orchestration, RAG, MCP, RPA and safety modules
- docs/ — architecture and engineering documentation
- tests/ — automated regression tests
- Dockerfile
- requirements.txt
- README.md

## Design principles

1. Local-first development for sensitive documents.
2. Least-privilege tool access.
3. Human approval for high-risk actions.
4. Auditable decisions and tool execution.
5. Synthetic data for public examples.
6. Separation of RAG, MCP, RPA and policy responsibilities.

## Implementation stages

Phase 1 — orchestration and safety foundation.
Phase 2 — vector retrieval with pgvector or Qdrant.
Phase 3 — MCP server and typed tools.
Phase 4 — Playwright RPA workflows.
Phase 5 — OCR and Document Intelligence.
Phase 6 — observability, evaluation and production hardening.

## Status

Foundation / engineering lab. Production integrations are isolated behind interfaces so they can be added without changing the safety boundary.

## Author

Anderson Leon Ayora
AI Engineer · Data Scientist

AYORAI TECH — Applied AI · AI Engineering · AI Safety · Automation
