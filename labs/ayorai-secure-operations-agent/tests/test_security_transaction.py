from datetime import datetime, timedelta, timezone

import pytest

from app.security_transaction import (
    CapabilityDefense,
    SecurityTransaction,
    SSITransactionEngine,
    SovereignDataCell,
)


def make_tx(**overrides):
    values = dict(
        requester="agent-047",
        operation="READ_BALANCE",
        resource="account-8472",
        purpose="customer_support",
        data_classification="RESTRICTED",
        provenance="trusted_internal",
    )
    values.update(overrides)
    return SecurityTransaction.create(**values)


def test_security_transaction_requires_two_independent_allows():
    engine = SSITransactionEngine()
    tx = make_tx()
    capability = engine.capability.issue(tx)

    a, b, result = engine.authorize(tx, capability)

    assert a.status == "ALLOW"
    assert b.status == "ALLOW"
    assert a.transaction_hash == b.transaction_hash == tx.transaction_hash
    assert result == "EXECUTE"


def test_capability_cannot_be_reused_for_different_transaction():
    engine = SSITransactionEngine()
    tx1 = make_tx(resource="account-1")
    tx2 = make_tx(resource="account-2")
    capability = engine.capability.issue(tx1)

    _, b, result = engine.authorize(tx2, capability)

    assert b.status == "DENY"
    assert "transaction" in " ".join(b.reasons)
    assert result == "QUARANTINE"


def test_semantic_and_crypto_disagreement_quarantines():
    engine = SSITransactionEngine()
    tx = make_tx(operation="DELETE_RECORD")
    capability = engine.capability.issue(tx)

    a, b, result = engine.authorize(tx, capability)

    assert a.status == "DENY"
    assert b.status == "ALLOW"
    assert result == "QUARANTINE"


def test_tampered_capability_quarantines():
    engine = SSITransactionEngine()
    tx = make_tx()
    capability = engine.capability.issue(tx)
    tampered = capability[:-1] + ("0" if capability[-1] != "0" else "1")

    _, b, result = engine.authorize(tx, tampered)

    assert b.status == "DENY"
    assert result == "QUARANTINE"


def test_untrusted_provenance_cannot_execute_even_with_valid_capability():
    engine = SSITransactionEngine()
    tx = make_tx(provenance="external")
    capability = engine.capability.issue(tx)

    a, b, result = engine.authorize(tx, capability)

    assert a.status == "DENY"
    assert b.status == "ALLOW"
    assert result == "QUARANTINE"


def test_expired_transaction_is_denied():
    tx = make_tx()
    expired = SecurityTransaction(
        **{
            **tx.canonical(),
            "expires_at": (datetime.now(timezone.utc) - timedelta(seconds=1)).isoformat(),
        }
    )
    engine = SSITransactionEngine()
    capability = engine.capability.issue(expired)

    a, b, result = engine.authorize(expired, capability)

    assert a.status == "DENY"
    assert b.status == "DENY"
    assert result == "QUARANTINE"


def test_sovereign_cell_returns_sealed_result_and_q_reveals_once():
    cell = SovereignDataCell()
    cell.put("account-8472", {"balance": 1250.50, "currency": "BRL"})
    tx = make_tx()

    capsule, q = cell.execute(tx, {"balance": 1250.50, "currency": "BRL"})

    assert capsule.ciphertext
    assert "1250.50" not in capsule.ciphertext

    result = cell.reveal(capsule, q, requester="agent-047")
    assert result == {"balance": 1250.50, "currency": "BRL"}

    with pytest.raises(PermissionError, match="replay"):
        cell.reveal(capsule, q, requester="agent-047")


def test_q_capability_cannot_reveal_another_capsule():
    cell = SovereignDataCell()
    cell.put("account-1", {"balance": 10})
    cell.put("account-2", {"balance": 20})
    tx1 = make_tx(resource="account-1")
    tx2 = make_tx(resource="account-2")

    capsule1, q1 = cell.execute(tx1, {"balance": 10})
    capsule2, _ = cell.execute(tx2, {"balance": 20})

    with pytest.raises(PermissionError, match="capsule"):
        cell.reveal(capsule2, q1, requester="agent-047")


def test_missing_capability_never_becomes_authority():
    engine = SSITransactionEngine()
    tx = make_tx()

    a, b, result = engine.authorize(tx, None)

    assert a.status == "ALLOW"
    assert b.status == "DENY"
    assert result == "QUARANTINE"
