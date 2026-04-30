import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Dict
from dataclasses import dataclass, field

MODEL_DIR = Path(__file__).parent.parent / "ml" / "models"

LABEL_MAP = {0: "HIGH", 1: "MEDIUM", 2: "LOW"}
RECOMMENDATIONS = {
    "HIGH": "Consider reviewing pricing strategy, reducing discounts, or evaluating product discontinuation.",
    "MEDIUM": "Monitor closely. Review cost structure and discount policies to stabilise margins.",
    "LOW": "Continue current strategy. Focus on growth opportunities.",
}


@dataclass
class RiskResult:
    product_id: str
    product_name: str
    risk_label: str
    risk_probability: float
    risk_factors: List[str] = field(default_factory=list)
    recommendation: str = ""
    profit_trend_slope: float = 0.0
    profit_margin_pct: float = 0.0
    avg_discount_rate: float = 0.0
    cost_growth_pct: float = 0.0
    yoy_revenue_change: float = 0.0


class RiskClassifier:
    def __init__(self):
        self.model = None
        self.product_features: Dict[str, dict] = {}
        self.product_names: Dict[str, str] = {}

    def _compute_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df["record_date"] = pd.to_datetime(df["record_date"])
        df["period"] = df["record_date"].dt.to_period("M")

        rows = []
        for pid in df["product_id"].unique():
            sub = df[df["product_id"] == pid].sort_values("record_date")
            monthly = sub.groupby("period").agg(
                profit=("profit", "sum"),
                revenue=("revenue", "sum"),
                cost=("cost", "sum"),
                discount_rate=("discount_rate", "mean"),
                product_name=("product_name", "first"),
            ).reset_index()

            if len(monthly) < 3:
                continue

            profits = monthly["profit"].values
            n = len(profits)

            # Trend slope (linear regression on last 6 months or all)
            window = min(6, n)
            y = profits[-window:]
            x = np.arange(window)
            slope = float(np.polyfit(x, y, 1)[0]) if window >= 2 else 0.0
            # Normalise slope by mean absolute profit
            mean_profit = float(np.mean(np.abs(y))) + 1e-9
            norm_slope = slope / mean_profit

            # Current margin (last quarter)
            q_rev = float(monthly["revenue"].iloc[-3:].sum())
            q_profit = float(monthly["profit"].iloc[-3:].sum())
            margin_pct = (q_profit / (q_rev + 1e-9)) * 100

            # Avg discount last quarter
            avg_discount = float(monthly["discount_rate"].iloc[-3:].mean()) * 100

            # Cost growth QoQ
            if len(monthly) >= 6:
                cost_now = float(monthly["cost"].iloc[-3:].sum())
                cost_prev = float(monthly["cost"].iloc[-6:-3].sum())
                cost_growth = (cost_now - cost_prev) / (abs(cost_prev) + 1e-9) * 100
            else:
                cost_growth = 0.0

            # YoY revenue change
            revenues = monthly["revenue"].values
            if n >= 13:
                yoy = (revenues[-1] - revenues[-13]) / (abs(revenues[-13]) + 1e-9) * 100
            else:
                yoy = 0.0

            rows.append({
                "product_id": pid,
                "product_name": monthly["product_name"].iloc[0],
                "profit_trend_slope": norm_slope,
                "profit_margin_pct": margin_pct,
                "avg_discount_rate": avg_discount,
                "cost_growth_pct": cost_growth,
                "yoy_revenue_change": yoy,
            })

        return pd.DataFrame(rows)

    def _heuristic_label(self, slope: float) -> int:
        if slope < -0.05:
            return 0  # HIGH
        elif slope < 0.02:
            return 1  # MEDIUM
        else:
            return 2  # LOW

    def train(self, df: pd.DataFrame):
        from sklearn.ensemble import RandomForestClassifier

        feat_df = self._compute_features(df)
        if feat_df.empty:
            return

        for _, row in feat_df.iterrows():
            self.product_features[row["product_id"]] = row.to_dict()
            self.product_names[row["product_id"]] = row["product_name"]

        X_cols = ["profit_trend_slope", "profit_margin_pct", "avg_discount_rate", "cost_growth_pct", "yoy_revenue_change"]
        X = feat_df[X_cols].fillna(0)
        y = feat_df["profit_trend_slope"].apply(self._heuristic_label)

        if len(X) < 2:
            return

        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X, y)

    def predict_product(self, product_id: str) -> RiskResult:
        feats = self.product_features.get(product_id)
        product_name = self.product_names.get(product_id, product_id)

        if not feats or self.model is None:
            return RiskResult(
                product_id=product_id,
                product_name=product_name,
                risk_label="MEDIUM",
                risk_probability=0.5,
                risk_factors=["Insufficient data for classification"],
                recommendation=RECOMMENDATIONS["MEDIUM"],
            )

        X_cols = ["profit_trend_slope", "profit_margin_pct", "avg_discount_rate", "cost_growth_pct", "yoy_revenue_change"]
        X = np.array([[feats[c] for c in X_cols]])
        pred = int(self.model.predict(X)[0])
        proba_row = self.model.predict_proba(X)[0]
        # predict_proba returns columns for each class seen during training
        classes = list(self.model.classes_)
        proba = float(proba_row[classes.index(pred)]) if pred in classes else float(proba_row.max())
        risk_label = LABEL_MAP.get(pred, "MEDIUM")

        risk_factors = self._build_risk_factors(feats, risk_label)

        return RiskResult(
            product_id=product_id,
            product_name=product_name,
            risk_label=risk_label,
            risk_probability=round(proba, 3),
            risk_factors=risk_factors,
            recommendation=RECOMMENDATIONS[risk_label],
            profit_trend_slope=round(feats["profit_trend_slope"], 4),
            profit_margin_pct=round(feats["profit_margin_pct"], 2),
            avg_discount_rate=round(feats["avg_discount_rate"], 2),
            cost_growth_pct=round(feats["cost_growth_pct"], 2),
            yoy_revenue_change=round(feats["yoy_revenue_change"], 2),
        )

    def _build_risk_factors(self, feats: dict, risk_label: str) -> List[str]:
        factors = []
        slope = feats["profit_trend_slope"]
        margin = feats["profit_margin_pct"]
        discount = feats["avg_discount_rate"]
        cost_growth = feats["cost_growth_pct"]
        yoy = feats["yoy_revenue_change"]

        if slope < -0.02:
            factors.append("Declining profit trend slope")
        if margin < 15:
            factors.append("Low profit margin")
        elif margin < 20:
            factors.append("Falling profit margins")
        if discount > 12:
            factors.append("Rising discount rate")
        if cost_growth > 10:
            factors.append("Significant cost growth")
        if yoy < -5:
            factors.append("Year-over-year revenue decline")

        if not factors:
            if risk_label == "LOW":
                factors.append("Stable profit trend")
                factors.append("Healthy margins")
            else:
                factors.append("Moderate market conditions")

        return factors[:3]

    def predict_all(self) -> List[RiskResult]:
        return [self.predict_product(pid) for pid in self.product_names]

    def save(self):
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        with open(MODEL_DIR / "risk_classifier.pkl", "wb") as f:
            pickle.dump({
                "model": self.model,
                "product_features": self.product_features,
                "product_names": self.product_names,
            }, f)

    @classmethod
    def load(cls) -> "RiskClassifier":
        path = MODEL_DIR / "risk_classifier.pkl"
        obj = cls()
        if path.exists():
            with open(path, "rb") as f:
                data = pickle.load(f)
            obj.model = data["model"]
            obj.product_features = data["product_features"]
            obj.product_names = data["product_names"]
        return obj
