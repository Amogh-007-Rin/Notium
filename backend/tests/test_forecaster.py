import pytest
from app.services.forecaster import ProfitForecaster


def test_forecaster_trains(sample_df):
    import pandas as pd
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    fc = ProfitForecaster()
    fc.train(df)
    assert "P001" in fc.product_names
    assert "P002" in fc.product_names


def test_forecaster_predict_shape(sample_df):
    import pandas as pd
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    fc = ProfitForecaster()
    fc.train(df)
    result = fc.forecast("P001", horizon=3)
    assert result.product_id == "P001"
    assert len(result.forecast) == 3
    assert result.forecast[0]["predicted_profit"] is not None


def test_forecaster_confidence_bounds(sample_df):
    import pandas as pd
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    fc = ProfitForecaster()
    fc.train(df)
    result = fc.forecast("P001", horizon=3)
    for fp in result.forecast:
        assert fp["lower_bound"] <= fp["predicted_profit"] <= fp["upper_bound"]


def test_forecaster_at_risk_flag(sample_df):
    import pandas as pd
    import numpy as np
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    # Make P002 declining to trigger at_risk
    df.loc[df["product_id"] == "P002", "profit"] *= np.linspace(1, 0.3, len(df[df["product_id"] == "P002"]))
    fc = ProfitForecaster()
    fc.train(df)
    result = fc.forecast("P002", horizon=3)
    assert isinstance(result.at_risk, bool)


def test_forecaster_insufficient_data():
    import pandas as pd
    from datetime import date
    rows = [{"record_date": date(2024, 1, 1), "product_id": "P099", "product_name": "New",
             "category": "Software", "segment": "SME",
             "revenue": 1000, "cost": 700, "profit": 300, "discount_rate": 0.05, "quantity": 10}]
    df = pd.DataFrame(rows)
    df["record_date"] = pd.to_datetime(df["record_date"])
    fc = ProfitForecaster()
    fc.train(df)
    result = fc.forecast("P099", horizon=3)
    assert result.warning is not None


def test_forecaster_at_risk_products(sample_df):
    import pandas as pd
    df = sample_df.copy()
    df["record_date"] = pd.to_datetime(df["record_date"])
    fc = ProfitForecaster()
    fc.train(df)
    at_risk = fc.get_at_risk_products()
    assert isinstance(at_risk, list)
