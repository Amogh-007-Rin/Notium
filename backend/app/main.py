from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.config import settings
from app.database import engine, SessionLocal
from app.models import user, financial_record, data_upload, audit_log  # noqa: registers models
from app.database import Base
from app.state import app_state
from app.services.forecaster import ProfitForecaster
from app.services.explainer import ProfitExplainer
from app.services.risk_classifier import RiskClassifier

from app.routers import auth, kpis, forecast, explain, risk, simulator, data, audit

app = FastAPI(
    title="Notium Profitability Intelligence Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(kpis.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(explain.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(simulator.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(audit.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

    if settings.SEED_ON_STARTUP:
        try:
            from app.utils.seed_data import seed_database, generate_seed_csv, train_models
            from pathlib import Path
            seed_path = Path(__file__).parent.parent / "data" / "seed" / "seed_data.csv"
            if not seed_path.exists():
                generate_seed_csv(str(seed_path))
            seed_database()
        except Exception as e:
            print(f"Seed error (non-fatal): {e}")

    # Load or train ML models
    from app.ml.models import MODEL_DIR
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    forecaster_path = MODEL_DIR / "forecaster.pkl"
    explainer_path = MODEL_DIR / "explainer.pkl"
    classifier_path = MODEL_DIR / "risk_classifier.pkl"

    if not settings.RETRAIN_MODELS_ON_STARTUP and forecaster_path.exists():
        app_state.forecaster = ProfitForecaster.load()
        app_state.explainer = ProfitExplainer.load()
        app_state.risk_classifier = RiskClassifier.load()
    else:
        try:
            import pandas as pd
            db = SessionLocal()
            from app.models.financial_record import FinancialRecord
            records = db.query(FinancialRecord).all()
            db.close()

            if records:
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

                app_state.forecaster = ProfitForecaster()
                app_state.forecaster.train(df)
                app_state.forecaster.save()

                app_state.explainer = ProfitExplainer()
                app_state.explainer.train(df)
                app_state.explainer.save()

                app_state.risk_classifier = RiskClassifier()
                app_state.risk_classifier.train(df)
                app_state.risk_classifier.save()
                print("ML models trained and ready.")
            else:
                app_state.forecaster = ProfitForecaster()
                app_state.explainer = ProfitExplainer()
                app_state.risk_classifier = RiskClassifier()
        except Exception as e:
            print(f"Model training error (non-fatal): {e}")
            app_state.forecaster = ProfitForecaster()
            app_state.explainer = ProfitExplainer()
            app_state.risk_classifier = RiskClassifier()


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "db": "connected",
        "models_loaded": all([
            app_state.forecaster is not None,
            app_state.explainer is not None,
            app_state.risk_classifier is not None,
        ]),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
