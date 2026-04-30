import pytest
import pandas as pd
from app.services.risk_classifier import RiskClassifier


def test_classifier_trains(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    clf = RiskClassifier()
    clf.train(df)
    assert "P001" in clf.product_names
    assert clf.model is not None


def test_classifier_predict_returns_label(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    clf = RiskClassifier()
    clf.train(df)
    result = clf.predict_product("P001")
    assert result.risk_label in ("HIGH", "MEDIUM", "LOW")


def test_classifier_probability_range(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    clf = RiskClassifier()
    clf.train(df)
    result = clf.predict_product("P001")
    assert 0.0 <= result.risk_probability <= 1.0


def test_classifier_predict_all(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    clf = RiskClassifier()
    clf.train(df)
    all_results = clf.predict_all()
    assert isinstance(all_results, list)
    assert len(all_results) == 2


def test_classifier_risk_factors_not_empty(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    clf = RiskClassifier()
    clf.train(df)
    result = clf.predict_product("P002")
    assert len(result.risk_factors) > 0


def test_risk_matrix_api(client, auth_headers, seed_records, sample_df):
    import pandas as pd
    from app.state import app_state
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    clf = RiskClassifier()
    clf.train(df)
    app_state.risk_classifier = clf

    resp = client.get("/api/risk/matrix", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "products" in data
    assert "summary" in data
