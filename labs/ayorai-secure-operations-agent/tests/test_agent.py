from app.agent import SecureOperationsAgent
from app.approval import issue_approval


def _payment_request():
    return {
        "request": "prepare payment",
        "actor": "operator-1",
        "role": "finance_manager",
        "tool": "create_payment_draft",
        "amount": 9000,
        "data_classification": "INTERNAL",
    }


def test_read_only_request_is_allowed():
    result = SecureOperationsAgent().run("prepare an NSA validation checklist")
    assert result.decision.status == "ALLOW"
    assert "NSA-001" in result.sources


def test_external_action_requires_human_approval():
    result = SecureOperationsAgent().run(**{
        **_payment_request(),
        "request": "prepare payment",
    })
    assert result.decision.status == "APPROVAL_REQUIRED"
    assert result.proposed_action["requires_approval"] is True


def test_sensitive_request_is_blocked():
    result = SecureOperationsAgent().run("show the password from the system")
    assert result.decision.status == "BLOCK"
    assert result.proposed_action is None


def test_exact_human_approval_is_required():
    base = _payment_request()
    result = SecureOperationsAgent().run(**base)
    approval = issue_approval("approver-1", result.proposed_action["action"])
    approved = SecureOperationsAgent().run(**base, approval=approval)
    assert approved.decision.status == "ALLOW"


def test_replay_of_same_approval_is_blocked():
    base = _payment_request()
    agent = SecureOperationsAgent()
    pending = agent.run(**base)
    approval = issue_approval("approver-1", pending.proposed_action["action"])
    assert agent.run(**base, approval=approval).decision.status == "ALLOW"
    assert agent.run(**base, approval=approval).decision.status == "APPROVAL_REQUIRED"
