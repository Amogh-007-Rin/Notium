from typing import Optional
from app.services.forecaster import ProfitForecaster
from app.services.explainer import ProfitExplainer
from app.services.risk_classifier import RiskClassifier


class AppState:
    forecaster: Optional[ProfitForecaster] = None
    explainer: Optional[ProfitExplainer] = None
    risk_classifier: Optional[RiskClassifier] = None


app_state = AppState()
