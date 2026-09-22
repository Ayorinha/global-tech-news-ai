from app.information_flow import Label
from app.intent_contract import IntentContract
from app.security_transaction import SecurityTransaction, SSITransactionEngine


def make_intent():
    return IntentContract(
        goal="consultar saldo da conta",
        resource="account-8472",
        purpose="customer_support",
        allowed_operations=frozenset({"READ_BALANCE"}),
        allowed_tools=frozenset({"read_balance"}),
        allowed_sequence=("read_balance",),
        max_data_classification="RESTRICTED",
    )


def make_tx(intent):
    return SecurityTransaction.create(
        requester="agent-047",
        operation="READ_BALANCE",
        resource="account-8472",
        purpose="customer_support",
        data_classification="RESTRICTED",
        provenance="trusted_internal",
        context_hash=intent.intent_hash,
    )


def test_intent_contract_binds_transaction():
    engine = SSITransactionEngine()
    intent = make_intent()
    tx = make_tx(intent)
    capability = engine.capability.issue(tx)

    _, _, result = engine.authorize(
        tx, capability, intent=intent, observed_tools=("read_balance",)
    )

    assert result == "EXECUTE"
    assert engine.last_guard_reasons == ()


def test_intent_contract_blocks_goal_switch():
    engine = SSITransactionEngine()
    intent = make_intent()
    tx = SecurityTransaction.create(
        requester="agent-047",
        operation="READ_BALANCE",
        resource="account-9999",
        purpose="customer_support",
        data_classification="RESTRICTED",
        provenance="trusted_internal",
        context_hash=intent.intent_hash,
    )
    capability = engine.capability.issue(tx)

    _, _, result = engine.authorize(tx, capability, intent=intent)

    assert result == "QUARANTINE"
    assert any("resource mismatch" in reason for reason in engine.last_guard_reasons)


def test_tool_chain_blocks_individually_allowed_but_unauthorized_sequence():
    engine = SSITransactionEngine()
    intent = make_intent()
    tx = make_tx(intent)
    capability = engine.capability.issue(tx)

    _, _, result = engine.authorize(
        tx,
        capability,
        intent=intent,
        observed_tools=("read_balance", "publish_external"),
    )

    assert result == "QUARANTINE"
    assert any("outside intent" in reason for reason in engine.last_guard_reasons)


def test_trajectory_drift_quarantines():
    engine = SSITransactionEngine()
    intent = make_intent()
    tx = make_tx(intent)
    capability = engine.capability.issue(tx)

    _, _, result = engine.authorize(
        tx,
        capability,
        intent=intent,
        observed_trajectory=("read_balance", "publish_external"),
    )

    assert result == "QUARANTINE"
    assert any("trajectory" in reason for reason in engine.last_guard_reasons)


def test_ifc_blocks_confidential_release_to_public_sink():
    engine = SSITransactionEngine()
    intent = make_intent()
    tx = make_tx(intent)
    capability = engine.capability.issue(tx)

    _, _, result = engine.authorize(
        tx,
        capability,
        intent=intent,
        source_label=Label(integrity="INTERNAL", confidentiality="CONFIDENTIAL"),
        sink_label=Label(integrity="SYSTEM", confidentiality="PUBLIC"),
    )

    assert result == "QUARANTINE"
    assert "ifc: information-flow release denied" in engine.last_guard_reasons


def test_ifc_allows_internal_processing_when_labels_permit():
    engine = SSITransactionEngine()
    intent = make_intent()
    tx = make_tx(intent)
    capability = engine.capability.issue(tx)

    _, _, result = engine.authorize(
        tx,
        capability,
        intent=intent,
        source_label=Label(integrity="INTERNAL", confidentiality="CONFIDENTIAL"),
        sink_label=Label(integrity="USER", confidentiality="RESTRICTED"),
    )

    assert result == "EXECUTE"
