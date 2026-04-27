"""Additional API tests to increase coverage for routers, schemas, and services."""
import pytest
import pandas as pd
import numpy as np
from datetime import date

from app.services.forecaster import ProfitForecaster
from app.services.explainer import ProfitExplainer
from app.services.risk_classifier import RiskClassifier
from app.state import app_state

# Import all schemas to ensure coverage
from app.schemas.kpis import KPISummary, ProductKPI, TimeSeriesPoint, TimeSeriesResponse, SegmentKPI
from app.schemas.forecast import ForecastResponse, ForecastPoint, HistoricalPoint, ModelAccuracy, AtRiskProduct, AtRiskResponse
from app.schemas.explain import ExplanationResponse, DriverDetail
from app.schemas.risk import RiskProduct, RiskSummary, RiskMatrixResponse, ProductRiskDetail


# ─── Schema validation tests ────────────────────────────────────────────────

def test_kpi_summary_schema():
    obj = KPISummary(
        total_revenue=1000.0, total_cost=600.0, total_profit=400.0,
        profit_margin_pct=40.0, cost_to_revenue_ratio=60.0,
        yoy_growth_pct=12.0, mom_change_pct=2.0, data_quality_score=98.5,
        last_refreshed="2024-12-31T00:00:00Z",
        filters_applied={"product": "all"},
    )
    assert obj.total_revenue == 1000.0


def test_product_kpi_schema():
    obj = ProductKPI(
        product_id="P001", product_name="Enterprise Suite",
        category="Software", segment="Enterprise",
        revenue=100000.0, cost=65000.0, profit=35000.0,
        profit_margin_pct=35.0, yoy_growth_pct=12.0,
        discount_impact_ratio=0.08, risk_label="LOW", risk_probability=0.1,
    )
    assert obj.risk_label == "LOW"


def test_time_series_schema():
    series = TimeSeriesResponse(
        product="All Products", granularity="monthly",
        series=[TimeSeriesPoint(period="2024-01", revenue=100000, cost=65000, profit=35000, margin_pct=35.0)],
    )
    assert len(series.series) == 1


def test_segment_kpi_schema():
    obj = SegmentKPI(segment="Enterprise", revenue=500000, cost=325000, profit=175000, profit_margin_pct=35.0, product_count=3)
    assert obj.segment == "Enterprise"


def test_forecast_schema():
    fp = ForecastPoint(period="2025-01", predicted_profit=38000.0, lower_bound=34000.0, upper_bound=42000.0)
    hp = HistoricalPoint(period="2024-12", actual_profit=36000.0)
    ma = ModelAccuracy(mae=1200.0, mape=3.2)
    resp = ForecastResponse(
        product_id="P001", product_name="Enterprise Suite",
        horizon_months=3, historical=[hp], forecast=[fp],
        at_risk=False, confidence_level=0.95, model_accuracy=ma, warning=None,
    )
    assert resp.at_risk is False


def test_at_risk_schema():
    obj = AtRiskProduct(product_id="P003", product_name="Basic Dashboard", predicted_decline_pct=-18.4, next_period="2025-Q1")
    resp = AtRiskResponse(at_risk_products=[obj])
    assert len(resp.at_risk_products) == 1


def test_explanation_schema():
    driver = DriverDetail(feature="quantity", display_name="Sales Volume", shap_value=2100.0, direction="positive", description="Volume increased.")
    resp = ExplanationResponse(
        product_id="P001", product_name="Enterprise Suite",
        month="2024-11", previous_month="2024-10",
        actual_profit=38500.0, previous_profit=35200.0,
        profit_change=3300.0, profit_change_pct=9.38,
        direction="increase", narrative_summary="Profit grew.",
        top_drivers=[driver], exportable=True,
    )
    assert resp.direction == "increase"


def test_risk_schema():
    rp = RiskProduct(
        product_id="P003", product_name="Basic Dashboard",
        risk_label="HIGH", risk_probability=0.82,
        risk_factors=["Declining trend"], recommendation="Review pricing.",
    )
    rs = RiskSummary(high_count=1, medium_count=2, low_count=5)
    resp = RiskMatrixResponse(period="2024-Q4", products=[rp], summary=rs)
    assert resp.summary.high_count == 1

    detail = ProductRiskDetail(
        product_id="P003", product_name="Basic Dashboard",
        risk_label="HIGH", risk_probability=0.82,
        risk_factors=["Declining trend"], recommendation="Review pricing.",
        profit_trend_slope=-0.1, profit_margin_pct=8.0,
        avg_discount_rate=18.0, cost_growth_pct=5.0, yoy_revenue_change=-12.0,
    )
    assert detail.risk_label == "HIGH"


# ─── Forecast API tests ─────────────────────────────────────────────────────

@pytest.fixture
def trained_forecaster(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    fc = ProfitForecaster()
    fc.train(df)
    return fc


@pytest.fixture
def trained_explainer(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    exp = ProfitExplainer()
    exp.train(df)
    return exp


@pytest.fixture
def trained_classifier(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    clf = RiskClassifier()
    clf.train(df)
    return clf


def test_forecast_predict_api(client, auth_headers, trained_forecaster):
    app_state.forecaster = trained_forecaster
    resp = client.get("/api/forecast/predict?product=P001&horizon=3", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["product_id"] == "P001"
    assert "historical" in data


def test_forecast_at_risk_api(client, auth_headers, trained_forecaster):
    app_state.forecaster = trained_forecaster
    resp = client.get("/api/forecast/at-risk-products", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "at_risk_products" in data
    assert isinstance(data["at_risk_products"], list)


def test_forecast_no_model(client, auth_headers):
    original = app_state.forecaster
    app_state.forecaster = None
    resp = client.get("/api/forecast/predict?product=P001", headers=auth_headers)
    assert resp.status_code == 503
    app_state.forecaster = original


# ─── Explainer API tests ─────────────────────────────────────────────────────

def test_explain_month_change_api(client, auth_headers, trained_explainer):
    app_state.explainer = trained_explainer
    resp = client.get("/api/explain/month-change?product=P001&month=2023-06", headers=auth_headers)
    assert resp.status_code in (200, 404)  # 404 if no data for that month


def test_explain_no_model(client, auth_headers):
    original = app_state.explainer
    app_state.explainer = None
    resp = client.get("/api/explain/month-change?product=P001&month=2023-06", headers=auth_headers)
    assert resp.status_code == 503
    app_state.explainer = original


def test_explain_missing_data(client, auth_headers, trained_explainer):
    app_state.explainer = trained_explainer
    resp = client.get("/api/explain/month-change?product=P001&month=2099-01", headers=auth_headers)
    assert resp.status_code == 404


# ─── Risk API detail test ─────────────────────────────────────────────────────

def test_risk_product_detail_api(client, auth_headers, trained_classifier):
    app_state.risk_classifier = trained_classifier
    resp = client.get("/api/risk/product/P001", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "risk_label" in data
    assert "profit_trend_slope" in data


# ─── Audit API tests ─────────────────────────────────────────────────────────

def test_audit_logs_api(client, finance_headers, finance_user):
    resp = client.get("/api/audit/logs", headers=finance_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "logs" in data


def test_audit_logs_requires_finance(client, auth_headers):
    resp = client.get("/api/audit/logs", headers=auth_headers)
    assert resp.status_code == 403


# ─── KPI export PDF test ─────────────────────────────────────────────────────

def test_kpi_export_pdf_api(client, auth_headers, seed_records):
    resp = client.post("/api/kpis/export-pdf", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"


# ─── Data quality and upload history ──────────────────────────────────────────

def test_data_quality_api(client, auth_headers):
    resp = client.get("/api/data/quality", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "quality_score" in data
    assert "total_records" in data


def test_upload_history_api(client, finance_headers, finance_user):
    resp = client.get("/api/data/uploads", headers=finance_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_upload_history_requires_finance(client, auth_headers):
    resp = client.get("/api/data/uploads", headers=auth_headers)
    assert resp.status_code == 403


# ─── Health check ─────────────────────────────────────────────────────────────

def test_health_check(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "db" in data
