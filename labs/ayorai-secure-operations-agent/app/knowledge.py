KNOWLEDGE = [
    {
        "id": "NSA-001",
        "title": "NSA return validation",
        "text": "Validate quantity of titles, total paid value and NSA return values before confirming a return file.",
        "keywords": {"nsa", "return", "validation", "titles", "value", "arquivo"},
    },
    {
        "id": "OPS-001",
        "title": "Operational evidence",
        "text": "Keep timestamps, source identifiers, decisions and validation results in an auditable record.",
        "keywords": {"audit", "evidence", "timestamp", "validation", "record"},
    },
    {
        "id": "SAFE-001",
        "title": "Human approval",
        "text": "External or irreversible actions require explicit human approval and bounded scope.",
        "keywords": {"approval", "external", "action", "human", "scope"},
    },
]


def retrieve(query: str, limit: int = 3) -> list[dict[str, str]]:
    tokens = set(query.lower().replace(",", " ").replace(".", " ").split())
    scored = []
    for item in KNOWLEDGE:
        score = len(tokens & item["keywords"])
        if score:
            scored.append((score, item))
    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [item for _, item in scored[:limit]]
