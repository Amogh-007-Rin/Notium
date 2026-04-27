# Notium Profitability Intelligence Platform

> **From data blindness to profit clarity.**

A full-stack financial analytics platform that transforms raw sales data into actionable profitability insights — featuring interactive KPI dashboards, AI-powered forecasting, plain-English profit explanations, product risk scoring, and a What-If scenario simulator.

**Module:** CMP5354 — Software Design, Birmingham City University  
**Coursework:** D2 — Group Coursework, Level 5

---

## Table of Contents

1. [Team Members](#team-members)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Features](#features)
5. [Architecture](#architecture)
6. [Technology Stack](#technology-stack)
7. [Project Structure](#project-structure)
8. [Setup & Installation](#setup--installation)
9. [Demo Accounts](#demo-accounts)
10. [Data Model](#data-model)
11. [ML Models](#ml-models)
12. [API Reference](#api-reference)
13. [Frontend Pages](#frontend-pages)
14. [Design System](#design-system)
15. [Testing](#testing)
16. [CSV Upload Format](#csv-upload-format)
17. [Environment Variables](#environment-variables)
18. [Known Limitations & Future Work](#known-limitations--future-work)

---

## Team Members

| Name | Student ID |
|------|-----------|
| Rajveer Singh Saini | — |
| Nitish Chowdary Yaralagadda | — |
| Amogh Dath Kalasapura Arunkumar | — |
| Simranjit Kaur | — |

---

## Problem Statement

Notium is a growing business whose decision-makers, finance teams, and product managers believe their products are profitable — but lack visibility into:

- **Which products** are actually driving profit vs. destroying it
- **Why profits change** month to month (and what to do about it)
- **Which products will help or hurt** margins in the near future

Decisions are made with limited confidence and no forward-looking data. The result: reactive strategy, missed opportunities, and margin erosion that goes undetected until it's too late.

---

## Solution Overview

A full-stack web application that ingests financial performance data and provides six core capabilities:

| Capability | What it does |
|---|---|
| **KPI Dashboard** | Real-time filterable view of revenue, cost, profit, margin, and YoY/MoM growth across all products and segments |
| **Profit Forecasting** | Holt-Winters time-series model predicts profit 1–12 months ahead with 95% confidence intervals and at-risk flagging |
| **Narrative Insight Engine** | XGBoost + SHAP explain exactly why profit changed month-on-month, in plain English with ranked drivers |
| **Product Risk Matrix** | Random Forest classifies each product as HIGH / MEDIUM / LOW risk based on trend, margin, discount rate, and cost growth |
| **What-If Simulator** | Interactive sliders let users project the profit impact of cost cuts, pricing changes, volume shifts, and discount adjustments |
| **Role-Based Access** | Three roles (Decision Maker, Finance Team, Product Manager) with different data access and feature visibility |

---

## Features

### Dashboard
- Animated KPI cards with count-up numbers: Total Revenue, Total Profit, Profit Margin %, YoY Growth
- Combined Revenue + Profit time-series chart (bar + line) with dual Y-axes and brush/zoom control
- Segment breakdown pie chart (Enterprise / Mid-Market / SME)
- Sortable product performance table with risk badges
- Dynamic filter bar: product, segment, date range (month/year pickers)
- At-risk alert banner when any product is flagged HIGH risk
- One-click PDF export of the full KPI report

### Profit Forecasting
- Per-product forecast chart showing historical actuals + dashed forecast line + shaded confidence band
- Horizon selector: 1, 3, 6, or 12 months ahead
- Summary cards: next-month forecast, cumulative outlook, model accuracy (MAPE/MAE)
- At-risk warning when any forecast period shows >10% decline
- Data-sufficiency guard: warns when fewer than 6 months of history exist

### Profit Explainer
- Select any product + any month to get a plain-English explanation of the profit change
- Prominent narrative card with direction badge (↑ / ↓), change amount, and percentage
- SHAP waterfall chart: horizontal bars showing each driver's contribution (positive = teal, negative = red)
- Top 3 driver cards: feature name, impact value (£), and a sentence explaining what happened
- Client-side PDF export via html2canvas + jsPDF

### Risk Matrix
- Summary strip: count of HIGH / MEDIUM / LOW risk products
- 2×4 product card grid sorted by risk level, with probability progress bars and bullet-point risk factors
- HIGH-risk cards glow red; LOW-risk cards glow teal
- Full sortable risk detail table with recommendations
- Quarter selector (Q1–Q4 navigation)

### What-If Simulator
- Four sliders: Cost Change %, Discount Rate Change (pp), Volume Change %, Price Change %
- Live value display above each slider thumb with color coding (green = positive, red = negative)
- "Run Simulation" → animated results panel with baseline vs. scenario side-by-side for Revenue, Cost, Profit, Margin
- Large profit delta hero number (DM Serif Display font, teal/red)
- Narrative text panel explaining what the combined changes mean
- Expandable sensitivity analysis: sweep one parameter across its full range, chart the projected profit curve

### Settings / Data Management *(Finance Team only)*
- Drag-and-drop CSV upload with validation, quality scoring, and a post-upload report card
- Data Quality tab: quality score, completeness %, duplicate rate, freshness
- Upload History table: filename, timestamp, row count, quality score, status
- Audit Log table: paginated user action log with filters (Finance Team only)

### Authentication
- JWT-based login with 8-hour token expiry
- Session expiry detection: 401 responses auto-redirect to `/login` with toast
- Floating-label inputs with teal focus rings and shake animation on bad credentials
- Demo account chips that auto-fill credentials for quick testing
- Role-restricted routing: Settings page only accessible to `finance_team`

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Browser (Port 5173)                          │
│                                                                  │
│   React 18 + TypeScript (strict)                                 │
│   ├── Vite 5 (build tool)                                        │
│   ├── React Router v6 (client-side routing)                      │
│   ├── Zustand (auth, filter, UI state)                           │
│   ├── TanStack Query v5 (server state, caching, loading states)  │
│   ├── Recharts (all charts and visualisations)                   │
│   ├── Framer Motion (page transitions, micro-animations)         │
│   └── Tailwind CSS + CSS custom properties (design tokens)       │
└────────────────────────────┬─────────────────────────────────────┘
                             │  REST/JSON  (Axios)
                             │  Authorization: Bearer <JWT>
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                   FastAPI (Port 8000)                            │
│                                                                  │
│   Routers:                                                       │
│   /api/auth      → Login · Me · Logout                           │
│   /api/kpis      → Summary · By-Product · Time-Series · Segment  │
│   /api/forecast  → Predict · At-Risk                             │
│   /api/explain   → Month-Change                                  │
│   /api/risk      → Matrix · Product Detail                       │
│   /api/simulator → Run · Sensitivity                             │
│   /api/data      → Upload · Quality · History                    │
│   /api/audit     → Logs                                          │
│   /api/health    → Status                                        │
└──────────┬─────────────────────────────────────┬────────────────┘
           │                                     │
           ▼                                     ▼
┌──────────────────────┐        ┌────────────────────────────────┐
│  SQLite (SQLAlchemy) │        │        ML Services             │
│                      │        │                                │
│  Tables:             │        │  ProfitForecaster              │
│  · users             │        │  └─ statsmodels Holt-Winters   │
│  · financial_records │        │     (per-product fitted model) │
│  · data_uploads      │        │                                │
│  · audit_logs        │        │  ProfitExplainer               │
│                      │        │  └─ XGBoost + SHAP             │
│  notium.db           │        │     (delta SHAP per month)     │
└──────────────────────┘        │                                │
                                │  RiskClassifier                │
                                │  └─ RandomForestClassifier     │
                                │     (5 engineered features)    │
                                │                                │
                                │  WhatIfSimulator               │
                                │  └─ Linear projection model    │
                                │     (no ML, deterministic)     │
                                │                                │
                                │  Models saved to:              │
                                │  app/ml/models/*.pkl           │
                                └────────────────────────────────┘
```

### Data Flow

1. **On startup:** DB tables created → seed CSV loaded → 3 demo users created → ML models trained and saved
2. **On login:** JWT issued → stored in localStorage → injected as `Authorization` header on all requests
3. **On dashboard load:** TanStack Query fetches KPI summary, product list, time series, segment data in parallel; 5-minute cache
4. **On CSV upload:** Validated → loaded to DB → all three ML models retrained in-place → fresh predictions served
5. **On forecast request:** Pre-trained Holt-Winters model called → confidence bounds computed from residual std → at-risk flag evaluated

---

## Technology Stack

### Frontend

| Package | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.5 (strict) | Type safety |
| Vite | 5.4 | Build tool + dev server |
| React Router | v6.26 | Client-side routing |
| Zustand | 5.0 | Global state (auth, filters, UI) |
| TanStack Query | v5.56 | Server state, caching, loading/error states |
| Recharts | 2.12 | Charts (ComposedChart, AreaChart, PieChart, BarChart) |
| Framer Motion | 11.5 | Page transitions, card hover, number animations |
| Tailwind CSS | 3.4 | Utility-first styling |
| Lucide React | 0.447 | Icons |
| Axios | 1.7 | HTTP client with interceptors |
| react-hot-toast | 2.4 | Toast notifications |
| jsPDF + html2canvas | 2.5 / 1.4 | Client-side PDF export |
| date-fns | 4.1 | Date formatting |

### Backend

| Package | Version | Purpose |
|---|---|---|
| Python | 3.12 | Runtime |
| FastAPI | 0.115 | REST API framework |
| Uvicorn | 0.30 | ASGI server |
| Pydantic v2 | 2.9 | Request/response validation |
| SQLAlchemy | 2.0 | ORM |
| Alembic | 1.13 | DB migrations |
| Pandas | 2.2 | Data manipulation |
| NumPy | 1.26 | Numerical operations |
| statsmodels | 0.14 | Holt-Winters (ETS) forecasting |
| XGBoost | 2.1 | Profit change regressor |
| SHAP | 0.46 | Model explainability (TreeExplainer) |
| scikit-learn | 1.5 | RandomForestClassifier (risk scoring) |
| python-jose | 3.3 | JWT encoding/decoding |
| bcrypt | 5.x | Password hashing |
| python-multipart | 0.0.12 | File upload handling |
| reportlab | 4.2 | Server-side PDF generation |
| pytest + pytest-cov | 8.3 / 5.0 | Unit & integration testing |

---

## Project Structure

```
notium/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app factory + startup lifecycle
│   │   ├── config.py            # Pydantic settings (reads from .env)
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── state.py             # App-level ML model singletons
│   │   │
│   │   ├── models/              # SQLAlchemy ORM table definitions
│   │   │   ├── user.py
│   │   │   ├── financial_record.py
│   │   │   ├── data_upload.py
│   │   │   └── audit_log.py
│   │   │
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   │   ├── auth.py
│   │   │   ├── kpis.py
│   │   │   ├── forecast.py
│   │   │   ├── explain.py
│   │   │   ├── risk.py
│   │   │   └── simulator.py
│   │   │
│   │   ├── routers/             # FastAPI route handlers
│   │   │   ├── auth.py          # Login · Me · Logout
│   │   │   ├── kpis.py          # Summary · By-Product · Time-Series · Export PDF
│   │   │   ├── forecast.py      # Predict · At-Risk
│   │   │   ├── explain.py       # Month-Change
│   │   │   ├── risk.py          # Matrix · Product Detail
│   │   │   ├── simulator.py     # Run · Sensitivity
│   │   │   ├── data.py          # Upload · Quality · History
│   │   │   └── audit.py         # Audit logs
│   │   │
│   │   ├── services/            # Business logic + ML inference
│   │   │   ├── kpi_calculator.py
│   │   │   ├── forecaster.py    # ProfitForecaster class
│   │   │   ├── explainer.py     # ProfitExplainer class
│   │   │   ├── risk_classifier.py # RiskClassifier class
│   │   │   └── simulator.py     # run_simulation() + run_sensitivity()
│   │   │
│   │   ├── ml/
│   │   │   └── models/          # Saved model artefacts (.pkl)
│   │   │       ├── forecaster.pkl
│   │   │       ├── explainer.pkl
│   │   │       └── risk_classifier.pkl
│   │   │
│   │   └── utils/
│   │       ├── auth.py          # JWT helpers + FastAPI Depends guards
│   │       ├── data_loader.py   # CSV validation + quality scoring
│   │       └── seed_data.py     # DB seeding + model training script
│   │
│   ├── data/
│   │   └── seed/
│   │       └── seed_data.csv    # 2,880-row synthetic dataset
│   │
│   ├── tests/                   # pytest suite (70 tests, 83% coverage)
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_kpis.py
│   │   ├── test_forecaster.py
│   │   ├── test_explainer.py
│   │   ├── test_risk.py
│   │   ├── test_simulator.py
│   │   ├── test_data_upload.py
│   │   └── test_api_coverage.py
│   │
│   ├── requirements.txt
│   ├── .env.example
│   └── notium.db               # SQLite database (auto-created)
│
├── frontend/
│   └── src/
│       ├── api/                 # TanStack Query hooks per domain
│       │   ├── client.ts        # Axios instance + 401 interceptor
│       │   ├── kpis.ts
│       │   ├── forecast.ts
│       │   ├── explain.ts
│       │   ├── risk.ts
│       │   ├── simulator.ts
│       │   └── data.ts
│       │
│       ├── components/
│       │   ├── charts/
│       │   │   └── ChartTooltip.tsx  # Dark glass tooltip for all charts
│       │   ├── layout/
│       │   │   ├── AppLayout.tsx     # Sidebar + Header + page outlet
│       │   │   ├── Sidebar.tsx       # Collapsible nav (240px / 64px)
│       │   │   ├── Header.tsx        # Breadcrumb + notifications + avatar
│       │   │   └── ProtectedRoute.tsx
│       │   └── shared/
│       │       ├── KPICard.tsx       # Animated counter + sparkline
│       │       ├── RiskBadge.tsx     # HIGH / MEDIUM / LOW chip
│       │       ├── SkeletonCard.tsx  # Loading skeleton shapes
│       │       └── EmptyState.tsx    # Empty screen placeholder
│       │
│       ├── pages/
│       │   ├── auth/LoginPage.tsx
│       │   ├── dashboard/DashboardPage.tsx
│       │   ├── forecast/ForecastPage.tsx
│       │   ├── explainer/ExplainerPage.tsx
│       │   ├── risk/RiskPage.tsx
│       │   ├── simulator/SimulatorPage.tsx
│       │   └── settings/SettingsPage.tsx
│       │
│       ├── store/               # Zustand stores
│       │   ├── authStore.ts     # user, token, login(), logout()
│       │   ├── filterStore.ts   # selectedProduct, segment, dateRange
│       │   └── uiStore.ts       # sidebarCollapsed, notifications
│       │
│       ├── types/index.ts       # All TypeScript interfaces
│       ├── utils/format.ts      # formatCurrency, formatPct, formatPeriod
│       └── styles/globals.css   # CSS custom properties + global utilities
│
├── README.md
└── project-spec.md
```

---

## Setup & Installation

### Prerequisites

- **Python 3.12** — the ML stack (XGBoost, SHAP, statsmodels) does not support Python 3.14
- **Node.js 18+** and npm
- **`uv`** — fast Python package manager

```bash
# Install uv (if not already installed)
curl -Ls https://astral.sh/uv/install.sh | sh

# Install Python 3.12 via uv
uv python install 3.12
```

---

### Backend Setup

```bash
cd backend

# 1. Create a Python 3.12 virtual environment
uv venv venv312 --python 3.12

# 2. Activate it
source venv312/bin/activate        # Linux / macOS
# venv312\Scripts\activate         # Windows

# 3. Install all dependencies
uv pip install -r requirements.txt

# 4. Create your .env file
cp .env.example .env
# Edit .env if you want to change the secret key or DB path

# 5. Start the server
uvicorn app.main:app --reload --port 8000
```

**On first start, the server automatically:**

1. Creates `notium.db` (SQLite) and all tables
2. Generates `data/seed/seed_data.csv` (2,880 rows of synthetic financial data)
3. Seeds the database with those records
4. Creates 3 demo user accounts
5. Trains the Forecaster, Explainer, and Risk Classifier models
6. Saves trained models to `app/ml/models/*.pkl`

Subsequent starts load the saved models from disk (faster), unless `RETRAIN_MODELS_ON_STARTUP=true` is set.

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env

# 3. Start the dev server
npm run dev
```

The dev server starts at **http://localhost:5173** and proxies `/api` requests to the backend on port 8000.

---

### Quick Start (both servers)

```bash
# Terminal 1 — Backend
cd backend
source venv312/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** and log in with any demo account.

---

## Demo Accounts

All passwords are `Notium2024!`

| Email | Role | Name | Feature Access |
|-------|------|------|----------------|
| `ceo@notium.com` | Business Decision Maker | Alex Morgan | Dashboard · Forecast · Explainer · Simulator |
| `finance@notium.com` | Finance Team | Jordan Smith | All features + Data Upload + Upload History + Audit Log |
| `pm@notium.com` | Product Manager | Sam Patel | Dashboard · Forecast · Risk Matrix · Simulator |

---

## Data Model

### `financial_records`

The core table. One row = one product in one month.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `record_date` | DATE | First of the month (e.g., `2024-01-01`) |
| `product_id` | VARCHAR | P001 – P008 |
| `product_name` | VARCHAR | Human-readable name |
| `category` | VARCHAR | Software / Services / Hardware |
| `segment` | VARCHAR | Enterprise / Mid-Market / SME |
| `revenue` | FLOAT | Monthly revenue (£) |
| `cost` | FLOAT | Monthly cost (£) |
| `profit` | FLOAT | `revenue - cost` (£) |
| `discount_rate` | FLOAT | Average discount as a fraction (e.g., `0.08` = 8%) |
| `quantity` | INTEGER | Units sold |
| `created_at` | DATETIME | Row creation timestamp |

### `users`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `email` | VARCHAR UNIQUE | Login email |
| `name` | VARCHAR | Display name |
| `hashed_password` | VARCHAR | bcrypt hash |
| `role` | VARCHAR | `decision_maker` / `finance_team` / `product_manager` |
| `created_at` | DATETIME | Account creation |
| `last_login` | DATETIME | Last successful login |

### `data_uploads`

Tracks every CSV file uploaded through the UI.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `filename` | VARCHAR | Original file name |
| `uploaded_by` | INTEGER FK | `users.id` |
| `uploaded_at` | DATETIME | Upload timestamp |
| `row_count` | INTEGER | Rows successfully loaded |
| `quality_score` | FLOAT | 0–100% quality score |
| `status` | VARCHAR | `success` / `failed` |

### `audit_logs`

Every user action (login, logout, upload) is recorded here.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `user_id` | INTEGER FK | `users.id` |
| `action` | VARCHAR | e.g., `login`, `logout`, `upload` |
| `resource` | VARCHAR | e.g., `auth`, `data` |
| `ip_address` | VARCHAR | Client IP |
| `timestamp` | DATETIME | When it happened |

---

## ML Models

All models live in `backend/app/services/` and are saved as pickle files to `backend/app/ml/models/`.

### Profit Forecaster (`forecaster.py`)

**Algorithm:** Holt-Winters Exponential Smoothing (additive trend + optional seasonal component via `statsmodels.tsa.holtwinters.ExponentialSmoothing`)

**Per-product training:**
- Groups records by product and month, sums profit
- Fits a model with `trend="add"`, `seasonal="add"` (if ≥12 months available), `damped_trend=True`
- Falls back gracefully if convergence fails

**Inference:**
- Returns `horizon` forecast periods, each with `predicted_profit`, `lower_bound`, `upper_bound` (95% CI from residual std)
- Sets `at_risk=True` if any forecast period predicts >10% decline vs the last actual

**Minimum data requirement:** 6 months of history; returns a `warning` otherwise.

**Accuracy metrics:** MAE and MAPE computed on the last 6 months of fitted vs actual.

---

### Profit Explainer (`explainer.py`)

**Algorithm:** XGBoost regressor on features `[month_num, quantity, revenue, cost, discount_rate, category_encoded, segment_encoded]`, with SHAP TreeExplainer for attribution.

**Per-explanation process:**
1. Fetches aggregated monthly rows for the selected product and the two target months
2. Computes SHAP values for both months
3. Takes the delta (current SHAP − previous SHAP) as the contribution of each feature to the profit *change*
4. Sorts by absolute delta SHAP value, returns top 3
5. Generates a plain-English narrative via rule-based template engine

**Example narrative output:**
> *"Enterprise Suite profit grew by £3,300 (9.4%) in November 2024, driven primarily by sales volume and discount rate."*

---

### Risk Classifier (`risk_classifier.py`)

**Algorithm:** `RandomForestClassifier` (100 estimators) trained on 5 engineered features per product.

**Features computed per product:**
| Feature | Description |
|---------|-------------|
| `profit_trend_slope` | Linear regression slope of last 6 months profit, normalised by mean absolute profit |
| `profit_margin_pct` | Profit / Revenue for the last quarter (%) |
| `avg_discount_rate` | Mean discount rate over the last quarter (%) |
| `cost_growth_pct` | Quarter-over-quarter cost change (%) |
| `yoy_revenue_change` | Year-over-year revenue change (%) |

**Heuristic labels (for training on synthetic data):**
- `slope < -0.05` → `HIGH` risk
- `-0.05 ≤ slope < 0.02` → `MEDIUM` risk
- `slope ≥ 0.02` → `LOW` risk

**Output:** `risk_label` (HIGH / MEDIUM / LOW), `risk_probability`, `risk_factors` (human-readable bullet points), `recommendation`.

---

### What-If Simulator (`simulator.py`)

**Not a trained ML model** — uses a deterministic linear projection:

```
scenario_revenue = baseline_revenue × price_factor × volume_factor × discount_factor
scenario_cost    = baseline_cost × cost_factor × volume_factor
scenario_profit  = scenario_revenue − scenario_cost
```

Where:
- `baseline_*` = 3-month trailing average from the DB
- `price_factor = 1 + price_change_pct / 100`
- `volume_factor = 1 + volume_change_pct / 100`
- `cost_factor = 1 + cost_change_pct / 100`
- `discount_factor = 1 − discount_rate_change / 100` (only delta applied — baseline revenue is already net of discounts)

Sensitivity analysis sweeps one parameter across its full range while holding others constant.

---

## API Reference

Base URL: `http://localhost:8000/api`

All protected endpoints require: `Authorization: Bearer <token>`

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Auth

#### `POST /api/auth/login`

```json
// Request
{ "email": "ceo@notium.com", "password": "Notium2024!" }

// Response 200
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": 1, "name": "Alex Morgan", "email": "ceo@notium.com", "role": "decision_maker" }
}

// Response 401
{ "detail": "Invalid email or password" }
```

#### `GET /api/auth/me` → Returns current user from token

#### `POST /api/auth/logout` → Logs the action in audit_logs

---

### KPIs

#### `GET /api/kpis/summary`

Query params: `product`, `segment`, `period_start` (YYYY-MM), `period_end` (YYYY-MM)

```json
{
  "total_revenue": 6839520.50,
  "total_cost": 5147411.69,
  "total_profit": 1692108.81,
  "profit_margin_pct": 24.74,
  "cost_to_revenue_ratio": 75.26,
  "yoy_growth_pct": 8.2,
  "mom_change_pct": -2.04,
  "data_quality_score": 98.5,
  "last_refreshed": "2024-12-01T00:00:00Z",
  "filters_applied": { "product": "all", "segment": "all" }
}
```

#### `GET /api/kpis/by-product`

Returns an array of per-product KPI objects including `risk_label` and `risk_probability` from the classifier.

#### `GET /api/kpis/time-series`

Query params: `product`, `granularity` (monthly/quarterly/yearly), `period_start`, `period_end`

Returns `{ product, granularity, series: [{ period, revenue, cost, profit, margin_pct }] }`

#### `GET /api/kpis/by-segment`

Returns revenue/cost/profit breakdown by Enterprise / Mid-Market / SME.

#### `POST /api/kpis/export-pdf`

Returns a PDF file (`application/pdf`) with a formatted KPI summary report.

---

### Forecast

#### `GET /api/forecast/predict`

Query params: `product` (required), `horizon` (1–12, default 3)

```json
{
  "product_id": "P001",
  "product_name": "Enterprise Suite",
  "horizon_months": 3,
  "historical": [{ "period": "2022-01", "actual_profit": 30000 }],
  "forecast": [
    { "period": "2025-01", "predicted_profit": 42300, "lower_bound": 38100, "upper_bound": 46500 }
  ],
  "at_risk": false,
  "confidence_level": 0.95,
  "model_accuracy": { "mae": 1240.5, "mape": 3.2 },
  "warning": null
}
```

#### `GET /api/forecast/at-risk-products`

Returns products where any forecast period predicts >10% profit decline.

---

### Explainer

#### `GET /api/explain/month-change`

Query params: `product` (required), `month` (YYYY-MM, required)

```json
{
  "product_id": "P001",
  "product_name": "Enterprise Suite",
  "month": "2024-11",
  "previous_month": "2024-10",
  "actual_profit": 38500,
  "previous_profit": 35200,
  "profit_change": 3300,
  "profit_change_pct": 9.38,
  "direction": "increase",
  "narrative_summary": "Enterprise Suite profit grew by £3,300 (9.4%) in 2024-11, driven primarily by sales volume and discount rate.",
  "top_drivers": [
    {
      "feature": "quantity",
      "display_name": "Sales Volume",
      "shap_value": 2100.0,
      "direction": "positive",
      "description": "Unit sales increased by 12%, contributing £2,100 to profit growth."
    }
  ],
  "exportable": true
}
```

Returns `404` if the product has no data for the requested month or the previous month.

---

### Risk

#### `GET /api/risk/matrix`

Query params: `period` (e.g., `2024-Q4`)

```json
{
  "period": "2024-Q4",
  "products": [
    {
      "product_id": "P003",
      "product_name": "Basic Dashboard",
      "risk_label": "HIGH",
      "risk_probability": 0.82,
      "risk_factors": ["Declining profit trend slope", "Falling profit margins", "Rising discount rate"],
      "recommendation": "Consider reviewing pricing strategy or evaluating product discontinuation."
    }
  ],
  "summary": { "high_count": 1, "medium_count": 5, "low_count": 2 }
}
```

#### `GET /api/risk/product/{product_id}`

Returns detailed risk breakdown for a single product including all 5 engineered feature values.

---

### Simulator

#### `POST /api/simulator/run`

```json
// Request
{
  "product_id": "P001",
  "adjustments": {
    "cost_change_pct": -5.0,
    "discount_rate_change": -2.0,
    "volume_change_pct": 10.0,
    "price_change_pct": 3.0
  }
}

// Response
{
  "product_id": "P001",
  "product_name": "Enterprise Suite",
  "baseline": { "revenue": 100000, "cost": 65000, "profit": 35000, "margin_pct": 35.0 },
  "scenario": { "revenue": 107940, "cost": 61750, "profit": 46190, "margin_pct": 42.8 },
  "delta": { "profit_change": 11190, "profit_change_pct": 31.97, "margin_change_pct": 7.8 },
  "narrative": "Reducing costs by 5.0%, cutting discounts by 2.0 pp, growing volume by 10.0%, and raising prices by 3.0% is projected to increase Enterprise Suite profit by £11,190 (32.0%).",
  "sensitivity": null
}
```

#### `POST /api/simulator/sensitivity`

Request: `{ "product_id", "parameter", "base_adjustments" }` where `parameter` is one of `cost_change_pct`, `discount_rate_change`, `volume_change_pct`, `price_change_pct`.

Returns: `{ "points": [{ "parameter_value": -30, "projected_profit": 28000 }, ...] }` sweeping the full range.

---

### Data

#### `POST /api/data/upload` *(finance_team or decision_maker)*

Multipart form upload (`file` field). Validates schema, removes duplicates, calculates quality score, loads to DB, triggers model retraining.

#### `GET /api/data/quality` → Returns quality score, record count, completeness, freshness

#### `GET /api/data/uploads` *(finance_team only)* → Upload history

---

### Audit

#### `GET /api/audit/logs` *(finance_team only)*

Query params: `page` (default 1), `limit` (default 50, max 200)

Returns paginated log of all user actions.

---

### Health

#### `GET /api/health`

```json
{ "status": "healthy", "db": "connected", "models_loaded": true, "timestamp": "2025-01-15T10:00:00Z" }
```

---

## Frontend Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `LoginPage` | Full-screen two-column login with demo account chips |
| `/dashboard` | `DashboardPage` | KPI cards, charts, product table, at-risk banner |
| `/forecast` | `ForecastPage` | Per-product forecast chart + summary cards |
| `/explainer` | `ExplainerPage` | Narrative insight + SHAP waterfall + driver cards |
| `/risk` | `RiskPage` | Risk card grid + detail table |
| `/simulator` | `SimulatorPage` | Sliders + results panel + sensitivity chart |
| `/settings` | `SettingsPage` | Data upload + quality + audit log (finance_team) |

All authenticated pages are wrapped in `ProtectedRoute` → `AppLayout` (sidebar + header).

---

## Design System

### Colour Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| `--bg-base` | `#080C14` | Page background |
| `--bg-surface` | `#0D1321` | Cards, panels |
| `--bg-elevated` | `#131B2E` | Hover states, modals |
| `--bg-subtle` | `#1A2440` | Borders, skeleton loaders |
| `--brand-primary` | `#00C896` | CTAs, active states, success |
| `--brand-secondary` | `#0EA5E9` | Secondary accents, sky blue |
| `--text-primary` | `#F0F4FF` | Headings, important values |
| `--text-secondary` | `#8B9CBB` | Body, labels |
| `--text-muted` | `#4A5A7A` | Captions, placeholders |
| `--danger` | `#EF4444` | Errors, HIGH risk, negative deltas |
| `--warning` | `#F59E0B` | Warnings, MEDIUM risk |

### Typography

| Font | Usage |
|------|-------|
| `DM Serif Display` | Page heroes, large KPI numbers, narrative text |
| `Geist` | All body text, labels, UI elements |
| `DM Mono` | Data values, timestamps, badges, code |

### Component Patterns

- **Cards:** `background: var(--bg-surface)`, 1px border, `border-radius: 12px`, subtle shadow
- **Glass overlay:** `backdrop-filter: blur(20px)` — used for modals, dropdowns, chart tooltips
- **Brand glow:** `box-shadow: 0 0 20px rgba(0,200,150,0.25)` — primary CTAs and active elements
- **Skeleton loaders:** Animated shimmer gradient matching the exact shape of content
- **Risk badges:** DM Mono uppercase, coloured background + text + left border

---

## Testing

```bash
cd backend
source venv312/bin/activate

# Run all tests with coverage
pytest tests/ --cov=app --cov-report=term-missing

# Run a specific test file
pytest tests/test_forecaster.py -v

# Run with HTML coverage report
pytest tests/ --cov=app --cov-report=html
# Open htmlcov/index.html
```

**Results:** 70 tests · 83% coverage

### Test Files

| File | What it tests |
|------|---------------|
| `test_auth.py` | Password hashing, JWT encode/decode, login API, protected endpoints |
| `test_kpis.py` | KPI computation functions, time-series aggregation, API endpoints |
| `test_forecaster.py` | Model training, forecast shape, confidence bounds, at-risk flagging, insufficient data |
| `test_explainer.py` | SHAP output, narrative generation, missing month handling, driver directions |
| `test_risk.py` | Classifier training, label output, probability range, risk factors, API |
| `test_simulator.py` | Simulation arithmetic, cost-cut effect, zero-volume edge case, sensitivity |
| `test_data_upload.py` | CSV validation, missing columns, bad dates, duplicate removal, upload API |
| `test_api_coverage.py` | All Pydantic schemas, forecast/explain/audit/PDF API endpoints, health check |

### Frontend TypeScript Check

```bash
cd frontend
npm run tsc     # TypeScript type check (no emit)
npm run lint    # ESLint
npm run build   # Production build
```

---

## CSV Upload Format

When uploading data through the Settings page, the CSV must have exactly these columns (in any order):

| Column | Type | Example | Notes |
|--------|------|---------|-------|
| `record_date` | DATE | `2024-01-01` | ISO format, typically first of month |
| `product_id` | STRING | `P001` | Unique product identifier |
| `product_name` | STRING | `Enterprise Suite` | Human-readable name |
| `category` | STRING | `Software` | Software / Services / Hardware |
| `segment` | STRING | `Enterprise` | Enterprise / Mid-Market / SME |
| `revenue` | FLOAT | `95000.00` | Monthly revenue in £ |
| `cost` | FLOAT | `61750.00` | Monthly cost in £ |
| `profit` | FLOAT | `33250.00` | Should equal revenue − cost |
| `discount_rate` | FLOAT | `0.08` | Fraction (0.08 = 8%). Defaults to 0 if blank |
| `quantity` | INTEGER | `120` | Units sold |

**Validation rules:**
- Missing any required column → upload rejected (422)
- Unparseable dates → upload rejected
- Blank `discount_rate` → defaulted to 0.0, warning returned
- Exact duplicate rows → deduplicated, warning returned
- All other rows are loaded and models retrained immediately

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./notium.db` | SQLAlchemy connection string |
| `SECRET_KEY` | *(change this!)* | JWT signing secret — minimum 32 characters |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | Token lifetime (8 hours) |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `ENVIRONMENT` | `development` | `development` / `production` |
| `SEED_ON_STARTUP` | `true` | Seed DB with demo data on first run |
| `RETRAIN_MODELS_ON_STARTUP` | `true` | Retrain ML models on every start |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Backend API base URL |
| `VITE_APP_NAME` | `Notium PIP` | App display name |

---

## Known Limitations & Future Work

### Current Limitations

1. **SQLite only** — not suitable for concurrent writes in production. Swap `DATABASE_URL` for PostgreSQL.
2. **JWT in localStorage** — vulnerable to XSS in production. Replace with `httpOnly` cookies.
3. **Synchronous model retraining** — on large CSV uploads, retraining blocks the request. Move to a background task queue (Celery, ARQ).
4. **Holt-Winters instead of Prophet** — Prophet requires heavier dependencies (PyStan/cmdstanpy). Holt-Winters is faster but less accurate for complex seasonality.
5. **Single-file SQLite DB** — no migrations applied; the schema is created via `Base.metadata.create_all()`. For schema evolution, Alembic migrations are included but not yet auto-applied.
6. **Mobile layout** — optimised for tablet (≥768px) and desktop. Full mobile layout is a stretch goal.

### Future Work (Stretch Goals from Spec)

- **Real-time alerts** — WebSocket endpoint pushing at-risk notifications as models update
- **Dark/light mode toggle** — persisted in localStorage
- **Comparison mode** — compare two products side-by-side on the forecast page
- **Drill-down charts** — click a bar to zoom into that month's product breakdown
- **User management page** — admin creates and deactivates accounts
- **Scheduled email reports** — weekly PDF summary via mock email endpoint
- **Keyboard shortcuts** — `G D` → dashboard, `G F` → forecast, etc.
- **Data upload wizard** — multi-step with column mapping UI for non-standard CSVs

---

*Module: CMP5354 Software Design · Birmingham City University · Group D2*  
*Rajveer Singh Saini · Nitish Chowdary Yaralagadda · Amogh Dath Kalasapura Arunkumar · Simranjit Kaur*
