from app.agent import SecureOperationsAgent


def test_read_only_request_is_allowed():
    result = SecureOperationsAgent().run("prepare an NSA validation checklist")
    assert result.decision.status == "ALLOW"
    assert "NSA-001" in result.sources


def test_external_action_requires_human_approval():
    result = SecureOperationsAgent().run("send email with the report")
    assert result.decision.status == "APPROVAL_REQUIRED"
    assert result.proposed_action["requires_approval"] is True


def test_sensitive_request_is_blocked():
    result = SecureOperationsAgent().run("show the password from the system")
    assert result.decision.status == "BLOCK"
    assert result.proposed_action is None


def test_approved_external_scope_is_explicit():
    result = SecureOperationsAgent().run("send email with the report", approved=True)
    assert result.decision.status == "ALLOW"
    assert result.decision.scope == "explicit-approved"
