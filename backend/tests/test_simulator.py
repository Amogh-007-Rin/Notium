import pytest
from app.services.simulator import run_simulation, run_sensitivity


def test_simulation_baseline(db, seed_records):
    result = run_simulation(db, "P001", {})
    assert result
    assert result["baseline"]["revenue"] > 0
    assert result["product_name"] == "Enterprise Suite"


def test_simulation_profit_increases_with_cost_cut(db, seed_records):
    baseline = run_simulation(db, "P001", {})
    scenario = run_simulation(db, "P001", {"cost_change_pct": -10})
    assert scenario["scenario"]["profit"] > baseline["baseline"]["profit"]


def test_simulation_negative_profit(db, seed_records):
    result = run_simulation(db, "P001", {"cost_change_pct": 200, "volume_change_pct": -90})
    assert result["delta"]["profit_change"] < 0


def test_simulation_zero_volume(db, seed_records):
    result = run_simulation(db, "P001", {"volume_change_pct": -100})
    assert result["scenario"]["revenue"] < result["baseline"]["revenue"]


def test_simulation_narrative_not_empty(db, seed_records):
    result = run_simulation(db, "P001", {"price_change_pct": 5})
    assert len(result["narrative"]) > 10


def test_sensitivity_returns_points(db, seed_records):
    points = run_sensitivity(db, "P001", "cost_change_pct", {})
    assert isinstance(points, list)
    assert len(points) > 5
    assert "parameter_value" in points[0]
    assert "projected_profit" in points[0]


def test_simulation_api(client, auth_headers, seed_records):
    resp = client.post("/api/simulator/run", headers=auth_headers, json={
        "product_id": "P001",
        "adjustments": {"cost_change_pct": -5, "volume_change_pct": 10}
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "delta" in data
