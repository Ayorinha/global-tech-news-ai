# AYORAI Enterprise AI Operations — Architecture

## System view

+--------------------- EXPERIENCE ----------------------+
| Operator UI → FastAPI API                             |
+----------------------------+--------------------------+
                             |
                             v
+------------------- INTELLIGENCE ----------------------+
| Agent Orchestrator → RAG Retrieval → LLM Adapter      |
+----------------------------+--------------------------+
                             |
                    MCP Client / Tools
                             |
            +----------------+----------------+
            |                                 |
            v                                 v
     Operational DB                     RPA Worker
                                             |
                                             v
                                      Browser / Legacy App

                    +----------------------+
                    |    AI SAFETY LAYER   |
                    | RBAC                  |
                    | Tool Allowlist        |
                    | Risk Policy           |
                    | Human Approval        |
                    | Audit Trail           |
                    +----------------------+

## Trust boundary

LLM output
  ↓
Schema validation
  ↓
Identity and role check
  ↓
Tool allowlist
  ↓
Risk threshold
  ↓
Human approval when required
  ↓
Tool execution
  ↓
Result validation
  ↓
Audit event

## Component responsibilities

| Component | Responsibility |
|---|---|
| Orchestrator | Routes requests and coordinates execution |
| RAG | Retrieves relevant enterprise knowledge |
| MCP | Exposes structured tools |
| RPA | Executes controlled browser workflows |
| Safety | Authorizes, constrains and validates actions |
| Audit | Records decisions and execution events |

The LLM is not an authorization authority. Tool calls are executable only after policy evaluation succeeds.
