from .mcp_tools import MCPToolRegistry
from .rag import RAGService
from .safety import evaluate_tool

class Orchestrator:
    def __init__(self) -> None:
        self.rag = RAGService()
        self.tools = MCPToolRegistry()

    def handle(self, query: str, role: str = "operator") -> dict:
        documents = self.rag.search(query)
        tool = "search_knowledge"
        decision = evaluate_tool(role, tool)
        return {
            "decision": "allowed" if decision.allowed else "blocked",
            "route": ["orchestrator", "rag", tool],
            "requires_approval": decision.requires_approval,
            "sources": [doc.source for doc in documents],
            "reason": decision.reason,
        }
