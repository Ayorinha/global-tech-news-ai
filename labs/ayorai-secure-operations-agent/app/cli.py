import json
import sys

from .agent import SecureOperationsAgent


def main() -> None:
    request = " ".join(sys.argv[1:]).strip()
    if not request:
        raise SystemExit('Usage: python -m app.cli "your request"')

    result = SecureOperationsAgent().run(request)
    print(json.dumps({
        "answer": result.answer,
        "sources": result.sources,
        "decision": result.decision.__dict__ if result.decision else None,
        "proposed_action": result.proposed_action,
        "audit": result.audit,
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
