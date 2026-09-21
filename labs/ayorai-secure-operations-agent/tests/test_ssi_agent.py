from app.approval import issue_approval
from app.ssi_agent import SSIAgent


def test_ssi_agent_routes_high_impact_action_to_approval():
    result = SSIAgent().run(
        "prepare payment",
        role="finance_manager",
        tool="create_payment_draft",
        amount=9000,
        data_classification="INTERNAL",
    )
    assert result.decision.status == "APPROVAL_REQUIRED"
    assert result.proposed_action["requires_approval"] is True
    assert result.audit_verified


def test_ssi_agent_accepts_only_exact_independent_approval():
    agent = SSIAgent()
    pending = agent.run(
        "prepare payment",
        actor="operator-1",
        role="finance_manager",
        tool="create_payment_draft",
        amount=9000,
        data_classification="INTERNAL",
    )
    approval = issue_approval("human-1", pending.proposed_action["action"])
    approved = agent.run(
        "prepare payment",
        actor="operator-1",
        role="finance_manager",
        tool="create_payment_draft",
        amount=9000,
        data_classification="INTERNAL",
        approval=approval,
    )
    assert approved.decision.status == "ALLOW"


def test_ssi_agent_blocks_external_context_for_action():
    result = SSIAgent().run(
        "create payment",
        role="finance_manager",
        tool="create_payment_draft",
        amount=100,
        data_classification="INTERNAL",
        provenance="external",
    )
    assert result.decision.status == "BLOCK"


def test_ssi_agent_keeps_model_independent_authorization():
    result = SSIAgent().run(
        "read internal report",
        role="analyst",
        tool="read_internal",
        data_classification="INTERNAL",
    )
    assert result.decision.status == "ALLOW"
    assert result.decision.allowed_tool


def test_ssi_agent_rejects_confidential_data_at_internal_tool():
    result = SSIAgent().run(
        "read confidential report",
        role="analyst",
        tool="read_internal",
        data_classification="CONFIDENTIAL",
    )
    assert result.decision.status == "BLOCK"
