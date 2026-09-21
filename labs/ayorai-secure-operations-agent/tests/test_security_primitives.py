from app.capabilities import Capability, attenuate, permits
from app.dlp import inspect, redact
from app.information_flow import Label
from app.runtime_guard import RuntimeGuard
from app.supply_chain import require_pinned_version, sha256_bytes, verify_sha256

def test_capability_cannot_escalate():
    parent = Capability("finance", "payments", frozenset({"draft"}), "INTERNAL", 10000)
    child = attenuate(parent, actions=frozenset({"draft"}), max_data_classification="PUBLIC", max_amount=100)
    assert permits(child, "draft", "PUBLIC", 100)
    try:
        attenuate(parent, actions=frozenset({"approve"}))
        assert False
    except ValueError:
        pass

def test_information_flow_is_monotonic():
    external = Label("EXTERNAL", "PUBLIC")
    secret = Label("INTERNAL", "CONFIDENTIAL")
    assert external.join(secret) == Label("EXTERNAL", "CONFIDENTIAL")
    assert not external.can_drive(Label("SYSTEM", "PUBLIC"))

def test_dlp_detects_and_redacts():
    text = "credential=supersecret"
    found, kinds = inspect(text)
    assert found and "credential" in kinds
    assert "supersecret" not in redact(text)

def test_runtime_guard_detects_exfiltration_sequence():
    guard = RuntimeGuard()
    guard.observe("a", "read_internal")
    assert guard.observe("a", "publish_external") == "ESCALATE"

def test_supply_chain_requires_pinning():
    digest = sha256_bytes(b"ssi")
    assert verify_sha256(b"ssi", digest)
    try:
        require_pinned_version("latest")
        assert False
    except ValueError:
        pass
