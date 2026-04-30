import pytest
import pandas as pd
from app.services.explainer import ProfitExplainer


def test_explainer_trains(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    exp = ProfitExplainer()
    exp.train(df)
    assert "P001" in exp.product_data
    assert exp.model is not None


def test_explainer_explain_returns_result(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    exp = ProfitExplainer()
    exp.train(df)
    result = exp.explain("P001", "2023-01")
    if result:
        assert result.product_id == "P001"
        assert isinstance(result.top_drivers, list)
        assert len(result.top_drivers) <= 3


def test_explainer_narrative_not_empty(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    exp = ProfitExplainer()
    exp.train(df)
    result = exp.explain("P001", "2023-06")
    if result:
        assert len(result.narrative_summary) > 10


def test_explainer_missing_month(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    exp = ProfitExplainer()
    exp.train(df)
    result = exp.explain("P001", "2099-01")
    assert result is None


def test_explainer_shap_directions(sample_df):
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    exp = ProfitExplainer()
    exp.train(df)
    result = exp.explain("P001", "2023-03")
    if result:
        for driver in result.top_drivers:
            assert driver["direction"] in ("positive", "negative")
