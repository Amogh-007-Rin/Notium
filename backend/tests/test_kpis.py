import pytest
from app.services.kpi_calculator import compute_summary, compute_by_product, compute_time_series, compute_by_segment


def test_summary_returns_expected_keys(db, seed_records):
    result = compute_summary(db)
    for key in ["total_revenue", "total_cost", "total_profit", "profit_margin_pct"]:
        assert key in result


def test_summary_values_positive(db, seed_records):
    result = compute_summary(db)
    assert result["total_revenue"] > 0
    assert result["total_profit"] > 0
    assert 0 < result["profit_margin_pct"] < 100


def test_by_product_returns_list(db, seed_records):
    result = compute_by_product(db)
    assert isinstance(result, list)
    assert len(result) >= 2


def test_by_product_fields(db, seed_records):
    result = compute_by_product(db)
    for item in result:
        assert "product_id" in item
        assert "profit_margin_pct" in item


def test_time_series_monthly(db, seed_records):
    result = compute_time_series(db, product="all", granularity="monthly")
    assert "series" in result
    assert len(result["series"]) > 0
    assert "period" in result["series"][0]
    assert "profit" in result["series"][0]


def test_time_series_product_filter(db, seed_records):
    result = compute_time_series(db, product="P001", granularity="monthly")
    assert result["product"] == "Enterprise Suite"


def test_by_segment(db, seed_records):
    result = compute_by_segment(db)
    assert isinstance(result, list)
    segs = [r["segment"] for r in result]
    assert "Enterprise" in segs or "Mid-Market" in segs


def test_kpi_summary_api(client, auth_headers, seed_records):
    resp = client.get("/api/kpis/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_revenue"] > 0


def test_kpi_by_product_api(client, auth_headers, seed_records):
    resp = client.get("/api/kpis/by-product", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_kpi_time_series_api(client, auth_headers, seed_records):
    resp = client.get("/api/kpis/time-series?product=all&granularity=monthly", headers=auth_headers)
    assert resp.status_code == 200


def test_kpi_by_segment_api(client, auth_headers, seed_records):
    resp = client.get("/api/kpis/by-segment", headers=auth_headers)
    assert resp.status_code == 200
