import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass

MODEL_DIR = Path(__file__).parent.parent / "ml" / "models"


@dataclass
class ForecastResult:
    product_id: str
    product_name: str
    horizon_months: int
    historical: List[dict]
    forecast: List[dict]
    at_risk: bool
    confidence_level: float
    mae: float
    mape: float
    warning: Optional[str]


class ProfitForecaster:
    def __init__(self):
        self.models: Dict[str, object] = {}
        self.product_names: Dict[str, str] = {}
        self.history: Dict[str, pd.Series] = {}

    def train(self, df: pd.DataFrame):
        from statsmodels.tsa.holtwinters import ExponentialSmoothing

        df = df.copy()
        df["period"] = df["record_date"].dt.to_period("M")
        monthly = df.groupby(["product_id", "product_name", "period"])["profit"].sum().reset_index()

        for pid in monthly["product_id"].unique():
            sub = monthly[monthly["product_id"] == pid].sort_values("period")
            self.product_names[pid] = sub["product_name"].iloc[0]
            series = sub.set_index("period")["profit"]
            self.history[pid] = series

            if len(series) < 6:
                continue
            try:
                model = ExponentialSmoothing(
                    series.values.astype(float),
                    trend="add",
                    seasonal="add" if len(series) >= 12 else None,
                    seasonal_periods=12 if len(series) >= 12 else None,
                    damped_trend=True,
                ).fit(optimized=True)
                self.models[pid] = model
            except Exception:
                pass

    def forecast(self, product_id: str, horizon: int = 3) -> ForecastResult:
        product_name = self.product_names.get(product_id, product_id)
        history = self.history.get(product_id)

        historical = []
        if history is not None:
            for period, value in history.items():
                historical.append({"period": str(period), "actual_profit": round(float(value), 2)})

        if product_id not in self.models:
            return ForecastResult(
                product_id=product_id,
                product_name=product_name,
                horizon_months=horizon,
                historical=historical,
                forecast=[],
                at_risk=False,
                confidence_level=0.95,
                mae=0.0,
                mape=0.0,
                warning="Insufficient data for reliable forecast. At least 6 months required.",
            )

        model = self.models[product_id]
        history_vals = history.values.astype(float)
        n = len(history_vals)

        # Simple confidence interval estimation via residual std
        fitted = model.fittedvalues
        residuals = history_vals[-min(n, 12):] - fitted[-min(n, 12):]
        std = float(np.std(residuals)) if len(residuals) > 1 else abs(float(np.mean(history_vals))) * 0.1
        z = 1.96  # 95% CI

        forecast_vals = model.forecast(horizon)
        last_period = history.index[-1]

        forecast_list = []
        for i, val in enumerate(forecast_vals):
            next_period = last_period + (i + 1)
            forecast_list.append({
                "period": str(next_period),
                "predicted_profit": round(float(val), 2),
                "lower_bound": round(float(val - z * std), 2),
                "upper_bound": round(float(val + z * std), 2),
            })

        last_actual = float(history_vals[-1])
        at_risk = any(fp["predicted_profit"] < last_actual * 0.9 for fp in forecast_list)

        # MAE / MAPE on last 6 months
        n_eval = min(6, n)
        actuals = history_vals[-n_eval:]
        preds = fitted[-n_eval:]
        mae = float(np.mean(np.abs(actuals - preds))) if n_eval > 0 else 0.0
        mape = float(np.mean(np.abs((actuals - preds) / (actuals + 1e-9))) * 100) if n_eval > 0 else 0.0

        return ForecastResult(
            product_id=product_id,
            product_name=product_name,
            horizon_months=horizon,
            historical=historical,
            forecast=forecast_list,
            at_risk=at_risk,
            confidence_level=0.95,
            mae=round(mae, 2),
            mape=round(mape, 2),
            warning=None,
        )

    def flag_at_risk(self, product_id: str) -> bool:
        if product_id not in self.models:
            return False
        result = self.forecast(product_id, horizon=3)
        return result.at_risk

    def get_at_risk_products(self) -> List[dict]:
        at_risk = []
        for pid in self.product_names:
            result = self.forecast(pid, horizon=3)
            if result.at_risk and result.forecast:
                last_actual = result.historical[-1]["actual_profit"] if result.historical else 1
                min_forecast = min(fp["predicted_profit"] for fp in result.forecast)
                decline_pct = round((min_forecast - last_actual) / (abs(last_actual) + 1e-9) * 100, 1)
                at_risk.append({
                    "product_id": pid,
                    "product_name": result.product_name,
                    "predicted_decline_pct": decline_pct,
                    "next_period": result.forecast[0]["period"] if result.forecast else "",
                })
        return at_risk

    def save(self):
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        with open(MODEL_DIR / "forecaster.pkl", "wb") as f:
            pickle.dump({"models": self.models, "product_names": self.product_names, "history": self.history}, f)

    @classmethod
    def load(cls) -> "ProfitForecaster":
        path = MODEL_DIR / "forecaster.pkl"
        obj = cls()
        if path.exists():
            with open(path, "rb") as f:
                data = pickle.load(f)
            obj.models = data["models"]
            obj.product_names = data["product_names"]
            obj.history = data["history"]
        return obj
