import numpy as np
import pandas as pd
from typing import Optional
from sqlalchemy.orm import Session
from app.models.financial_record import FinancialRecord


def get_baseline(db: Session, product_id: str) -> dict:
    records = db.query(FinancialRecord).filter(
        FinancialRecord.product_id == product_id
    ).order_by(FinancialRecord.record_date.desc()).limit(3).all()

    if not records:
        return {"revenue": 0, "cost": 0, "profit": 0, "margin_pct": 0,
                "discount_rate": 0, "quantity": 0, "product_name": product_id}

    rev = np.mean([r.revenue for r in records])
    cost = np.mean([r.cost for r in records])
    profit = np.mean([r.profit for r in records])
    margin = (profit / (rev + 1e-9)) * 100
    discount = np.mean([r.discount_rate for r in records])
    qty = np.mean([r.quantity for r in records])

    return {
        "revenue": round(float(rev), 2),
        "cost": round(float(cost), 2),
        "profit": round(float(profit), 2),
        "margin_pct": round(float(margin), 2),
        "discount_rate": float(discount),
        "quantity": float(qty),
        "product_name": records[0].product_name,
    }


def run_simulation(db: Session, product_id: str, adjustments: dict) -> dict:
    baseline = get_baseline(db, product_id)
    if not baseline["revenue"]:
        return {}

    cost_change_pct = adjustments.get("cost_change_pct", 0)
    discount_rate_change = adjustments.get("discount_rate_change", 0)
    volume_change_pct = adjustments.get("volume_change_pct", 0)
    price_change_pct = adjustments.get("price_change_pct", 0)

    price_factor = 1 + price_change_pct / 100
    volume_factor = 1 + volume_change_pct / 100
    new_cost = baseline["cost"] * (1 + cost_change_pct / 100)
    # Only the delta in discount rate affects net revenue (baseline revenue already net of discounts)
    discount_factor = 1 - (discount_rate_change / 100)

    scenario_revenue = baseline["revenue"] * price_factor * volume_factor * discount_factor
    scenario_cost = new_cost * volume_factor
    scenario_profit = scenario_revenue - scenario_cost
    scenario_margin = (scenario_profit / (scenario_revenue + 1e-9)) * 100

    profit_change = scenario_profit - baseline["profit"]
    profit_change_pct = (profit_change / (abs(baseline["profit"]) + 1e-9)) * 100
    margin_change = scenario_margin - baseline["margin_pct"]

    narrative = _generate_sim_narrative(
        product_name=baseline["product_name"],
        cost_change_pct=cost_change_pct,
        discount_rate_change=discount_rate_change,
        volume_change_pct=volume_change_pct,
        price_change_pct=price_change_pct,
        profit_change=profit_change,
        profit_change_pct=profit_change_pct,
        baseline_margin=baseline["margin_pct"],
        scenario_margin=scenario_margin,
    )

    return {
        "product_id": product_id,
        "product_name": baseline["product_name"],
        "baseline": {
            "revenue": baseline["revenue"],
            "cost": baseline["cost"],
            "profit": baseline["profit"],
            "margin_pct": baseline["margin_pct"],
        },
        "scenario": {
            "revenue": round(float(scenario_revenue), 2),
            "cost": round(float(scenario_cost), 2),
            "profit": round(float(scenario_profit), 2),
            "margin_pct": round(float(scenario_margin), 2),
        },
        "delta": {
            "profit_change": round(float(profit_change), 2),
            "profit_change_pct": round(float(profit_change_pct), 2),
            "margin_change_pct": round(float(margin_change), 2),
        },
        "narrative": narrative,
        "sensitivity": None,
    }


def _generate_sim_narrative(product_name, cost_change_pct, discount_rate_change,
                             volume_change_pct, price_change_pct,
                             profit_change, profit_change_pct, baseline_margin, scenario_margin) -> str:
    parts = []
    if cost_change_pct:
        direction = "Reducing" if cost_change_pct < 0 else "Increasing"
        parts.append(f"{direction} costs by {abs(cost_change_pct)}%")
    if discount_rate_change:
        direction = "cutting" if discount_rate_change < 0 else "raising"
        parts.append(f"{direction} discounts by {abs(discount_rate_change)} percentage points")
    if volume_change_pct:
        direction = "growing" if volume_change_pct > 0 else "reducing"
        parts.append(f"{direction} volume by {abs(volume_change_pct)}%")
    if price_change_pct:
        direction = "raising" if price_change_pct > 0 else "lowering"
        parts.append(f"{direction} prices by {abs(price_change_pct)}%")

    if not parts:
        return f"No adjustments applied to {product_name}."

    intro = ", ".join(parts[:-1])
    if len(parts) > 1:
        intro += f", and {parts[-1]}"
    else:
        intro = parts[0]

    direction_word = "increase" if profit_change >= 0 else "decrease"
    return (
        f"{intro} is projected to {direction_word} {product_name} profit by "
        f"£{abs(profit_change):,.0f} ({abs(profit_change_pct):.1f}%), "
        f"improving margins from {baseline_margin:.1f}% to {scenario_margin:.1f}%."
    )


def run_sensitivity(db: Session, product_id: str, parameter: str, base_adjustments: dict) -> list:
    ranges = {
        "cost_change_pct": np.arange(-30, 31, 2),
        "discount_rate_change": np.arange(-5, 5.5, 0.5),
        "volume_change_pct": np.arange(-30, 31, 2),
        "price_change_pct": np.arange(-20, 21, 2),
    }
    sweep = ranges.get(parameter, np.arange(-10, 11, 1))
    points = []
    for val in sweep:
        adj = dict(base_adjustments)
        adj[parameter] = float(val)
        result = run_simulation(db, product_id, adj)
        if result:
            points.append({
                "parameter_value": float(val),
                "projected_profit": result["scenario"]["profit"],
            })
    return points
