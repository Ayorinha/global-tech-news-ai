class RPAWorker:
    """Browser automation boundary for Playwright workflows."""

    def run(self, workflow: str, approved: bool = False) -> dict:
        if not approved:
            return {"status": "blocked", "reason": "human_approval_required"}
        return {"status": "simulated", "workflow": workflow}
