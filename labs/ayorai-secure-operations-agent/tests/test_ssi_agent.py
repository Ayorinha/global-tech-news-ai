from app.ssi_agent import SSIAgent


def test_ssi_agent_routes_high_impact_action_to_approval():
    result = SSIAgent().run(
        "prepare payment",
        role="finance_manager",
        tool="create_payment_draft",
        amount=9000,
    )
    assert result.decision.status == "APPROVAL_REQUIRED"
    assert result.proposed_action["requires_approval"] is True
    assert result.audit_verified


def test_ssi_agent_blocks_external_context_for_action():
    result = SSIAgent().run(
        "create payment",
        role="finance_manager",
        tool="create_payment_draft",
        amount=100,
        provenance="external",
    )
    assert result.decision.status == "BLOCK"


def test_ssi_agent_keeps_model_independent_authorization():
    result = SSIAgent().run("read internal report", role="analyst", tool="read_internal")
    assert result.decision.status == "ALLOW"
    assert result.decision.allowed_tool
