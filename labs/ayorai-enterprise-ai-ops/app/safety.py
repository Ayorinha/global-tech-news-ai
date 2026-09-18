from dataclasses import dataclass

@dataclass(frozen=True)
class SafetyDecision:
    allowed: bool
    requires_approval: bool
    reason: str

TOOL_RISK = {
    "search_knowledge": "low",
    "read_database": "medium",
    "generate_report": "medium",
    "run_rpa": "high",
}

def evaluate_tool(role: str, tool_name: str, amount: float = 0) -> SafetyDecision:
    if tool_name not in TOOL_RISK:
        return SafetyDecision(False, False, "tool_not_allowlisted")
    if role not in {"operator", "analyst", "admin"}:
        return SafetyDecision(False, False, "role_not_authorized")
    if TOOL_RISK[tool_name] == "high" and role != "admin":
        return SafetyDecision(False, False, "high_risk_tool_requires_admin")
    if amount > 1000:
        return SafetyDecision(True, True, "amount_exceeds_approval_threshold")
    return SafetyDecision(True, False, "policy_allowed")
