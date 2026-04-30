"""Generates seed data CSV, seeds DB, and trains ML models."""
import os
import sys
import numpy as np
import pandas as pd
from datetime import date, timedelta
from pathlib import Path

# Ensure app is importable when run directly
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal, engine
from app.models.user import User
from app.models.financial_record import FinancialRecord
import app.models  # noqa: registers all models
from app.database import Base
from app.utils.auth import get_password_hash


PRODUCTS = [
    {"id": "P001", "name": "Enterprise Suite",    "category": "Software",  "segment": "Enterprise"},
    {"id": "P002", "name": "Analytics Pro",       "category": "Software",  "segment": "Mid-Market"},
    {"id": "P003", "name": "Basic Dashboard",     "category": "Software",  "segment": "SME"},
    {"id": "P004", "name": "Consulting Services", "category": "Services",  "segment": "Enterprise"},
    {"id": "P005", "name": "Training Packages",   "category": "Services",  "segment": "Mid-Market"},
    {"id": "P006", "name": "Hardware Bundle",     "category": "Hardware",  "segment": "Enterprise"},
    {"id": "P007", "name": "Support Contracts",   "category": "Services",  "segment": "SME"},
    {"id": "P008", "name": "Cloud Storage Add-on","category": "Software",  "segment": "Mid-Market"},
]

SEED_USERS = [
    {"email": "ceo@notium.com",     "password": "Notium2024!", "role": "decision_maker",  "name": "Alex Morgan"},
    {"email": "finance@notium.com", "password": "Notium2024!", "role": "finance_team",    "name": "Jordan Smith"},
    {"email": "pm@notium.com",      "password": "Notium2024!", "role": "product_manager", "name": "Sam Patel"},
]


def generate_seed_csv(output_path: str):
    rng = np.random.default_rng(42)
    rows = []
    start = date(2022, 1, 1)
    months = 36

    for m in range(months):
        d = date(start.year + (start.month + m - 1) // 12, (start.month + m - 1) % 12 + 1, 1)
        t = m / 35.0  # normalized time 0→1

        for p in PRODUCTS:
            pid = p["id"]

            if pid == "P001":  # Enterprise Suite: strong growth, high margin ~35%
                base_rev = 85_000 + 35_000 * t
                margin = 0.35 + 0.02 * t + rng.normal(0, 0.01)
                discount = rng.uniform(0.05, 0.10)
                qty = int(rng.normal(120 + 40 * t, 5))

            elif pid == "P002":  # Analytics Pro: Q4 seasonal, medium margin ~22%
                q4_boost = 1.25 if d.month in (10, 11, 12) else 1.0
                base_rev = 60_000 * q4_boost + 10_000 * t + rng.normal(0, 2000)
                margin = 0.22 + rng.normal(0, 0.02)
                discount = rng.uniform(0.08, 0.15)
                qty = int(rng.normal(90 * q4_boost, 8))

            elif pid == "P003":  # Basic Dashboard: declining from mid-2023
                decline = max(0, t - 0.43)
                base_rev = 40_000 - 18_000 * decline + rng.normal(0, 1500)
                margin = max(0.05, 0.18 - 0.12 * decline + rng.normal(0, 0.01))
                discount = rng.uniform(0.12, 0.22)
                qty = int(max(10, rng.normal(60 - 30 * decline, 5)))

            elif pid == "P004":  # Consulting Services: high revenue, variable margin
                base_rev = 120_000 + 20_000 * t + rng.normal(0, 8000)
                margin = 0.28 + rng.normal(0, 0.04)
                discount = rng.uniform(0.03, 0.12)
                qty = int(rng.normal(15, 3))

            elif pid == "P005":  # Training Packages: low volume, consistent margin
                base_rev = 25_000 + 3_000 * t + rng.normal(0, 1000)
                margin = 0.30 + rng.normal(0, 0.02)
                discount = rng.uniform(0.05, 0.08)
                qty = int(rng.normal(40, 4))

            elif pid == "P006":  # Hardware Bundle: declining margins (rising costs)
                base_rev = 90_000 + 5_000 * t + rng.normal(0, 3000)
                margin = max(0.05, 0.25 - 0.14 * t + rng.normal(0, 0.02))
                discount = rng.uniform(0.06, 0.10)
                qty = int(rng.normal(30, 4))

            elif pid == "P007":  # Support Contracts: stable, LOW risk
                base_rev = 35_000 + 2_000 * t + rng.normal(0, 500)
                margin = 0.32 + rng.normal(0, 0.01)
                discount = rng.uniform(0.02, 0.05)
                qty = int(rng.normal(200, 10))

            else:  # P008 Cloud Storage: growing fast, low margin
                base_rev = 20_000 + 40_000 * t + rng.normal(0, 2000)
                margin = max(0.05, 0.12 + rng.normal(0, 0.02))
                discount = rng.uniform(0.08, 0.15)
                qty = int(rng.normal(300 + 200 * t, 20))

            revenue = max(1000, base_rev)
            cost = revenue * (1 - margin)
            profit = revenue - cost
            dr = round(float(rng.choice([discount], 1)[0]), 4)

            rows.append({
                "record_date": d.strftime("%Y-%m-%d"),
                "product_id": p["id"],
                "product_name": p["name"],
                "category": p["category"],
                "segment": p["segment"],
                "revenue": round(float(revenue), 2),
                "cost": round(float(cost), 2),
                "profit": round(float(profit), 2),
                "discount_rate": dr,
                "quantity": max(1, qty),
            })

    df = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} rows → {output_path}")
    return df


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed users
        for u in SEED_USERS:
            if not db.query(User).filter(User.email == u["email"]).first():
                db.add(User(
                    email=u["email"],
                    name=u["name"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                ))
        db.commit()
        print("Users seeded.")

        # Seed financial records
        if db.query(FinancialRecord).count() == 0:
            seed_path = Path(__file__).parent.parent.parent / "data" / "seed" / "seed_data.csv"
            if not seed_path.exists():
                generate_seed_csv(str(seed_path))
            df = pd.read_csv(seed_path)
            df["record_date"] = pd.to_datetime(df["record_date"]).dt.date
            records = [FinancialRecord(**row) for row in df.to_dict("records")]
            db.bulk_save_objects(records)
            db.commit()
            print(f"Seeded {len(records)} financial records.")
        else:
            print("Financial records already exist, skipping seed.")
    finally:
        db.close()


def train_models():
    from app.services.forecaster import ProfitForecaster
    from app.services.explainer import ProfitExplainer
    from app.services.risk_classifier import RiskClassifier

    db = SessionLocal()
    try:
        records = db.query(FinancialRecord).all()
        if not records:
            print("No records to train on.")
            return
        df = pd.DataFrame([{
            "record_date": r.record_date,
            "product_id": r.product_id,
            "product_name": r.product_name,
            "category": r.category,
            "segment": r.segment,
            "revenue": r.revenue,
            "cost": r.cost,
            "profit": r.profit,
            "discount_rate": r.discount_rate,
            "quantity": r.quantity,
        } for r in records])
        df["record_date"] = pd.to_datetime(df["record_date"])
    finally:
        db.close()

    forecaster = ProfitForecaster()
    forecaster.train(df)
    forecaster.save()
    print("Forecaster trained and saved.")

    explainer = ProfitExplainer()
    explainer.train(df)
    explainer.save()
    print("Explainer trained and saved.")

    classifier = RiskClassifier()
    classifier.train(df)
    classifier.save()
    print("Risk classifier trained and saved.")


if __name__ == "__main__":
    seed_path = str(Path(__file__).parent.parent.parent / "data" / "seed" / "seed_data.csv")
    if not Path(seed_path).exists():
        generate_seed_csv(seed_path)
    seed_database()
    train_models()
    print("All done.")
