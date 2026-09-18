from app.safety import evaluate_tool

def test_unknown_tool_is_blocked():
    assert evaluate_tool("operator", "unknown_tool").allowed is False

def test_high_risk_tool_requires_admin():
    decision = evaluate_tool("operator", "run_rpa")
    assert decision.allowed is False

def test_approval_threshold_is_enforced():
    decision = evaluate_tool("admin", "read_database", amount=1500)
    assert decision.allowed is True
    assert decision.requires_approval is True
