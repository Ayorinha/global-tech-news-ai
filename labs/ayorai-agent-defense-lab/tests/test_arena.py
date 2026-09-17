from app.arena import AgentArena


def test_arena_is_synthetic_and_audited():
    arena = AgentArena()
    results = arena.run()
    assert len(results) >= 1
    assert arena.audit.export()
    snapshot = arena.ledger.snapshot()
    assert "ACC-1001" in snapshot["accounts"]
    assert all("Synthetic" in a["owner"] for a in snapshot["accounts"].values())


def test_no_external_targets_in_health_contract():
    from app.api import health
    assert health()["external_targets"] is False
    assert health()["synthetic_data_only"] is True
