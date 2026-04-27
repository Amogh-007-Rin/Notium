import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field
from typing import List

MODEL_DIR = Path(__file__).parent.parent / "ml" / "models"

FEATURE_DISPLAY = {
    "quantity": "Sales Volume",
    "discount_rate": "Discount Rate",
    "cost": "Operating Cost",
    "revenue": "Revenue",
    "month_num": "Seasonality",
    "category_encoded": "Product Category",
    "segment_encoded": "Customer Segment",
}


@dataclass
class ExplanationResult:
    product_id: str
    product_name: str
    month: str
    previous_month: str
    actual_profit: float
    previous_profit: float
    profit_change: float
    profit_change_pct: float
    direction: str
    narrative_summary: str
    top_drivers: List[dict] = field(default_factory=list)


class ProfitExplainer:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.feature_names: List[str] = []
        self.product_data: dict = {}

    def _build_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df["month_num"] = df["record_date"].dt.month
        df["category_encoded"] = pd.Categorical(df["category"]).codes
        df["segment_encoded"] = pd.Categorical(df["segment"]).codes
        return df

    def train(self, df: pd.DataFrame):
        import xgboost as xgb
        import shap

        df = self._build_features(df)
        features = ["month_num", "quantity", "revenue", "cost", "discount_rate", "category_encoded", "segment_encoded"]
        X = df[features].fillna(0)
        y = df["profit"]

        self.feature_names = features
        self.model = xgb.XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42)
        self.model.fit(X, y)
        self.explainer = shap.TreeExplainer(self.model)

        # Store monthly profit per product for lookups
        df["period"] = df["record_date"].dt.to_period("M")
        for pid in df["product_id"].unique():
            sub = df[df["product_id"] == pid].copy()
            monthly = sub.groupby("period").agg({
                "profit": "sum",
                "quantity": "sum",
                "revenue": "sum",
                "cost": "sum",
                "discount_rate": "mean",
                "month_num": "first",
                "category_encoded": "first",
                "segment_encoded": "first",
                "product_name": "first",
            }).reset_index()
            self.product_data[pid] = monthly

    def explain(self, product_id: str, month: str) -> Optional[ExplanationResult]:
        if product_id not in self.product_data or self.model is None:
            return None

        monthly = self.product_data[product_id]
        try:
            target_period = pd.Period(month, freq="M")
        except Exception:
            return None

        current_row = monthly[monthly["period"] == target_period]
        if current_row.empty:
            return None

        prev_period = target_period - 1
        prev_row = monthly[monthly["period"] == prev_period]
        if prev_row.empty:
            return None

        cur = current_row.iloc[0]
        prv = prev_row.iloc[0]

        actual_profit = float(cur["profit"])
        previous_profit = float(prv["profit"])
        profit_change = actual_profit - previous_profit
        profit_change_pct = (profit_change / (abs(previous_profit) + 1e-9)) * 100
        direction = "increase" if profit_change >= 0 else "decrease"

        features = self.feature_names
        cur_X = pd.DataFrame([cur[features].values], columns=features)
        prv_X = pd.DataFrame([prv[features].values], columns=features)

        cur_shap = self.explainer.shap_values(cur_X)[0]
        prv_shap = self.explainer.shap_values(prv_X)[0]
        delta_shap = cur_shap - prv_shap

        drivers = []
        for i, feat in enumerate(features):
            drivers.append((feat, delta_shap[i]))

        drivers.sort(key=lambda x: abs(x[1]), reverse=True)
        top3 = drivers[:3]

        top_driver_list = []
        for feat, sv in top3:
            d_dir = "positive" if sv >= 0 else "negative"
            display = FEATURE_DISPLAY.get(feat, feat)
            desc = self._driver_description(feat, sv, cur, prv)
            top_driver_list.append({
                "feature": feat,
                "display_name": display,
                "shap_value": round(float(sv), 2),
                "direction": d_dir,
                "description": desc,
            })

        narrative = self._generate_narrative(
            product_name=str(cur["product_name"]),
            profit_change=profit_change,
            profit_change_pct=profit_change_pct,
            direction=direction,
            month=month,
            top_drivers=top_driver_list,
        )

        return ExplanationResult(
            product_id=product_id,
            product_name=str(cur["product_name"]),
            month=month,
            previous_month=str(prev_period),
            actual_profit=round(actual_profit, 2),
            previous_profit=round(previous_profit, 2),
            profit_change=round(profit_change, 2),
            profit_change_pct=round(profit_change_pct, 2),
            direction=direction,
            narrative_summary=narrative,
            top_drivers=top_driver_list,
        )

    def _driver_description(self, feat: str, sv: float, cur, prv) -> str:
        sign = "increased" if sv >= 0 else "decreased"
        amount = abs(round(float(sv), 0))
        if feat == "quantity":
            diff = int(cur["quantity"]) - int(prv["quantity"])
            pct = round(diff / (abs(int(prv["quantity"])) + 1) * 100, 1)
            return f"Unit sales {'increased' if diff >= 0 else 'decreased'} by {abs(diff)} units ({abs(pct)}%), contributing £{amount:,.0f} to profit {'growth' if sv >= 0 else 'decline'}."
        elif feat == "discount_rate":
            diff = round((float(cur["discount_rate"]) - float(prv["discount_rate"])) * 100, 2)
            return f"Average discount {'reduced' if diff < 0 else 'increased'} by {abs(diff)} percentage points, {'recovering' if sv >= 0 else 'losing'} £{amount:,.0f} in margin."
        elif feat == "cost":
            diff = round(float(cur["cost"]) - float(prv["cost"]), 0)
            return f"Costs {'rose' if diff > 0 else 'fell'} by £{abs(diff):,.0f}, {'partially offsetting gains' if sv < 0 else 'boosting margin'}."
        elif feat == "revenue":
            return f"Revenue movement contributed £{amount:,.0f} {'positively' if sv >= 0 else 'negatively'} to profit."
        else:
            return f"{FEATURE_DISPLAY.get(feat, feat)} {sign} profit impact by £{amount:,.0f}."

    def _generate_narrative(self, product_name, profit_change, profit_change_pct, direction, month, top_drivers) -> str:
        change_str = f"£{abs(profit_change):,.0f} ({abs(profit_change_pct):.1f}%)"
        dir_word = "grew" if direction == "increase" else "declined"
        top = top_drivers[0]["display_name"].lower() if top_drivers else "various factors"
        second = top_drivers[1]["display_name"].lower() if len(top_drivers) > 1 else None

        narrative = f"{product_name} profit {dir_word} by {change_str} in {month}, driven primarily by {top}"
        if second:
            narrative += f" and {second}"
        narrative += "."
        return narrative

    def save(self):
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        with open(MODEL_DIR / "explainer.pkl", "wb") as f:
            pickle.dump({
                "model": self.model,
                "explainer": self.explainer,
                "feature_names": self.feature_names,
                "product_data": self.product_data,
            }, f)

    @classmethod
    def load(cls) -> "ProfitExplainer":
        path = MODEL_DIR / "explainer.pkl"
        obj = cls()
        if path.exists():
            with open(path, "rb") as f:
                data = pickle.load(f)
            obj.model = data["model"]
            obj.explainer = data["explainer"]
            obj.feature_names = data["feature_names"]
            obj.product_data = data["product_data"]
        return obj
