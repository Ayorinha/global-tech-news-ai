from dataclasses import dataclass

@dataclass
class RetrievedDocument:
    source: str
    content: str
    score: float

class RAGService:
    """Retrieval boundary for pgvector/Qdrant integration."""

    def search(self, query: str, limit: int = 5) -> list[RetrievedDocument]:
        return [
            RetrievedDocument(
                source="docs/operations-policy.md",
                content=f"Retrieval placeholder for: {query}",
                score=1.0,
            )
        ][:limit]
