# Notium Profitability Intelligence Platform — Full-Stack Project Specification

> **For Claude Code:** Read this entire document before writing a single line of code.
> This is the authoritative source of truth for architecture, features, UI/UX, and implementation.
> Follow every section precisely. When in doubt, choose the more complete, more polished option.

---

## 0. Claude Code Instructions & Skills

Before starting, Claude Code must:

1. **Read `/mnt/skills/public/frontend-design/SKILL.md`** — mandatory before writing any React component, page, or CSS. This skill defines the design philosophy, typography rules, animation standards, and anti-patterns to avoid. Every UI element must comply with it.
2. Use the **frontend-design skill** for: all React components, dashboard pages, charts, modals, forms, sidebar, navigation, and any visual element.
3. Apply **production-grade standards** throughout: TypeScript strict mode, ESLint, Prettier, proper error boundaries, loading states, and empty states on every screen.
4. **Never** use generic AI aesthetics: no Inter/Roboto/Arial, no purple gradients, no cookie-cutter card layouts. The UI must feel like a premium enterprise financial product — think Bloomberg Terminal meets Linear.app.
5. Commit to the **design direction defined in Section 3** and execute it with absolute precision across every screen.

---

## 1. Project Overview

**Product Name:** Notium Profitability Intelligence Platform (PIP)
**Tagline:** From data blindness to profit clarity.
**Module:** CMP5354 — Software Design, Birmingham City University
**Coursework:** D2 — Group Coursework, Level 5

### 1.1 Problem Being Solved

Notium is a growing business whose decision makers, finance teams, and product managers believe their products are profitable — but lack visibility into:
- **Which products** are actually driving profit
- **Why profits change** month to month
- **Which products will help or hurt** profits in the near future

Decisions are made with limited confidence and no forward visibility.

### 1.2 Solution Summary

A full-stack web application that ingests financial performance data (revenue, cost, profit, discount, segments, time) and provides:
1. An **interactive KPI dashboard** with real-time filterable financial metrics
2. A **predictive profit forecasting** view (Facebook Prophet-style logic)
3. A **plain-English narrative insight** engine (XGBoost + SHAP-style explainability)
4. A **product risk classification matrix** (Random Forest-style risk scoring)
5. A **What-If scenario simulator** (interactive sliders → projected profit impact)
6. **Role-based access control** (Business Decision Maker / Finance Team / Product Manager)

---

## 2. Technology Stack

### 2.1 Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18+ | UI framework |
| TypeScript | 5+ | Type safety (strict mode) |
| Vite | 5+ | Build tool |
| React Router v6 | latest | Client-side routing |
| Zustand | latest | Global state management |
| TanStack Query (React Query) | v5 | Server state, caching, loading states |
| Recharts | latest | All charts and data visualisations |
| Framer Motion | latest | Page transitions and micro-animations |
| Tailwind CSS | v3 | Utility-first styling |
| shadcn/ui | latest | Base component primitives (customised heavily) |
| Lucide React | latest | Icons |
| date-fns | latest | Date formatting and manipulation |
| Papa Parse | latest | CSV parsing for data upload |
| jsPDF + html2canvas | latest | PDF export |
| Axios | latest | HTTP client |

### 2.2 Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Backend language |
| FastAPI | latest | REST API framework |
| Uvicorn | latest | ASGI server |
| Pandas | latest | Data manipulation |
| NumPy | latest | Numerical operations |
| Scikit-learn | latest | Random Forest risk classifier |
| XGBoost | latest | Profit change explainer model |
| Prophet (or statsmodels) | latest | Time-series profit forecasting |
| SHAP | latest | Model explainability values |
| SQLite | built-in | Local database (via SQLAlchemy) |
| SQLAlchemy | latest | ORM |
| Alembic | latest | Database migrations |
| Python-Jose | latest | JWT authentication |
| Passlib + bcrypt | latest | Password hashing |
| Python-multipart | latest | File upload handling |
| Pydantic v2 | latest | Request/response validation |
| python-dotenv | latest | Environment variable management |

### 2.3 Project Structure

```
notium-pip/
├── frontend/                    # React + TypeScript app
│   ├── src/
│   │   ├── api/                 # Axios API client functions
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # shadcn primitives (Button, Card, etc.)
│   │   │   ├── charts/          # Chart wrapper components
│   │   │   ├── layout/          # Sidebar, Header, PageWrapper
│   │   │   └── shared/          # KPICard, RiskBadge, NarrativeCard, etc.
│   │   ├── pages/               # Full page views
│   │   │   ├── auth/            # Login page
│   │   │   ├── dashboard/       # KPI overview
│   │   │   ├── forecast/        # Predictive forecast view
│   │   │   ├── explainer/       # Month-on-month narrative
│   │   │   ├── risk/            # Product risk matrix
│   │   │   ├── simulator/       # What-If simulator
│   │   │   └── settings/        # User/data settings
│   │   ├── store/               # Zustand global state
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript interfaces
│   │   ├── utils/               # Helper functions
│   │   └── styles/              # Global CSS + Tailwind config
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                     # FastAPI Python app
│   ├── app/
│   │   ├── main.py              # FastAPI app factory
│   │   ├── config.py            # Settings from env vars
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routers/             # FastAPI route handlers
│   │   │   ├── auth.py
│   │   │   ├── kpis.py
│   │   │   ├── forecast.py
│   │   │   ├── explain.py
│   │   │   ├── risk.py
│   │   │   ├── simulator.py
│   │   │   └── data.py
│   │   ├── services/            # Business logic
│   │   │   ├── kpi_calculator.py
│   │   │   ├── forecaster.py
│   │   │   ├── explainer.py
│   │   │   ├── risk_classifier.py
│   │   │   └── simulator.py
│   │   ├── ml/                  # ML model training + inference
│   │   │   ├── train_forecaster.py
│   │   │   ├── train_explainer.py
│   │   │   ├── train_classifier.py
│   │   │   └── models/          # Saved model artifacts (.pkl)
│   │   └── utils/
│   │       ├── auth.py          # JWT helpers
│   │       └── data_loader.py   # CSV ingestion + validation
│   ├── data/
│   │   ├── raw/                 # Uploaded CSV files
│   │   ├── processed/           # Cleaned, feature-engineered data
│   │   └── seed/                # seed_data.csv (sample dataset)
│   ├── tests/                   # pytest unit tests (80%+ coverage)
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic/                 # DB migrations
│
├── docker-compose.yml           # Optional: containerised dev environment
├── README.md                    # Setup and run instructions
└── .gitignore
```

---

## 3. UI/UX Design System

> **Read `/mnt/skills/public/frontend-design/SKILL.md` before implementing any component.**

### 3.1 Design Direction

**Aesthetic:** Luxury-refined dark enterprise. Think Bloomberg Terminal meets Linear.app meets a premium fintech product. Clean, dense with information but never cluttered. Every pixel intentional.

**Core Feeling:** The user should feel *in control of complex financial data*. Calm authority. Data clarity. Professional power.

### 3.2 Color Palette

Define all colors as CSS custom properties in `globals.css`:

```css
:root {
  /* Backgrounds */
  --bg-base:        #080C14;   /* Deepest background */
  --bg-surface:     #0D1321;   /* Cards, panels */
  --bg-elevated:    #131B2E;   /* Hover states, modals */
  --bg-subtle:      #1A2440;   /* Borders, dividers */

  /* Brand */
  --brand-primary:  #00C896;   /* Teal green — primary CTA, active states */
  --brand-secondary:#0EA5E9;   /* Sky blue — secondary accents */
  --brand-dim:      rgba(0,200,150,0.12); /* Brand tint for backgrounds */

  /* Text */
  --text-primary:   #F0F4FF;   /* Headings */
  --text-secondary: #8B9CBB;   /* Body, labels */
  --text-muted:     #4A5A7A;   /* Captions, placeholders */

  /* Semantic */
  --success:        #00C896;
  --warning:        #F59E0B;
  --danger:         #EF4444;
  --info:           #0EA5E9;

  /* Borders */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.10);
  --border-strong:  rgba(255,255,255,0.18);

  /* Risk colors */
  --risk-high:      #EF4444;
  --risk-medium:    #F59E0B;
  --risk-low:       #00C896;
}
```

### 3.3 Typography

```css
/* Import in index.html */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Geist:wght@300;400;500;600;700&display=swap');

:root {
  --font-display: 'DM Serif Display', Georgia, serif;  /* Page titles, big numbers */
  --font-body:    'Geist', 'Helvetica Neue', sans-serif; /* All body text, UI */
  --font-mono:    'DM Mono', 'Courier New', monospace;  /* Numbers, KPI values, code */
}
```

**Typography scale:**
- `text-4xl` (36px) DM Serif Display — page heroes, big KPI numbers
- `text-2xl` (24px) Geist 600 — section headings
- `text-lg` (18px) Geist 500 — card titles
- `text-base` (16px) Geist 400 — body text
- `text-sm` (14px) Geist 400 — labels, captions
- `text-xs` (12px) DM Mono — data values, timestamps, badges

### 3.4 Component Design Tokens

```css
/* Cards */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2);
}

/* Glassmorphism overlay (for modals, dropdowns) */
.glass {
  background: rgba(13,19,33,0.85);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-default);
}

/* Brand glow effect (for active elements, CTAs) */
.glow-brand {
  box-shadow: 0 0 20px rgba(0,200,150,0.25), 0 0 40px rgba(0,200,150,0.10);
}
```

### 3.5 Layout

- **Sidebar:** 240px fixed left sidebar, dark `--bg-base`, collapsible to 64px icon-only mode
- **Header:** 56px top header with breadcrumb, user avatar, notifications bell, data freshness timestamp
- **Content area:** fluid, max-width 1400px centered, `--bg-base` background
- **Grid system:** CSS Grid with 12 columns, 24px gaps
- **Spacing:** 4px base unit, scale: 4/8/12/16/24/32/48/64px

### 3.6 Animations (Framer Motion)

```typescript
// Page entrance — staggered fade+slide up
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

// Card hover
const cardHover = {
  whileHover: { y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.35)', borderColor: 'var(--border-default)' },
  transition: { duration: 0.2 }
};

// Number counter animation — KPI cards count up on mount
// Use Framer Motion's useMotionValue + useTransform for animated numbers

// Chart entrance — bars/lines draw from left
// Use Recharts animation props: animationBegin=0, animationDuration=1200, animationEasing="ease-out"
```

### 3.7 Global UI Patterns

**KPI Card:**
- Dark card with 1px border
- Top-left: metric label (text-sm, muted)
- Center: large animated number (DM Serif Display, text-4xl, --text-primary)
- Bottom-left: change indicator (↑ +12.4% vs last month) colored green/red
- Bottom-right: mini sparkline (Recharts AreaChart, 60px wide)

**Risk Badge:**
- `HIGH` — red background (#EF4444/15%), red text, red left border
- `MEDIUM` — amber background, amber text
- `LOW` — teal background, teal text
- Font: DM Mono, uppercase, letter-spacing wide

**Data Table:**
- Dark striped rows (alternating `--bg-surface` / `--bg-elevated`)
- Sticky header
- Sort indicators on column headers
- Row hover: subtle brand tint background
- Pagination with page size selector

**Loading States:**
- Skeleton loaders matching the exact shape of the content (not generic spinners)
- Use `animate-pulse` with `--bg-subtle` color

**Empty States:**
- Centered illustration (SVG icon) + heading + body text + CTA button
- Never show a blank white/dark screen

**Toast Notifications:**
- Bottom-right, dark glass style
- Success (green left border), Error (red), Info (blue)
- Auto-dismiss after 4s

---

## 4. Authentication System

### 4.1 Users & Roles

Three roles with different data access and dashboard views:

| Role | Display Name | Access Level |
|---|---|---|
| `decision_maker` | Business Decision Maker | Aggregated KPIs, forecasts, narratives, What-If |
| `finance_team` | Finance & Operations | Full KPI detail, data quality, audit logs, cost breakdown |
| `product_manager` | Product Manager | Product-level KPIs, risk matrix, forecasts per product, What-If |

### 4.2 Seed Users (for demo)

```python
# backend/app/utils/seed_users.py — create on first run
users = [
  { "email": "ceo@notium.com",     "password": "Notium2024!", "role": "decision_maker", "name": "Alex Morgan" },
  { "email": "finance@notium.com", "password": "Notium2024!", "role": "finance_team",   "name": "Jordan Smith" },
  { "email": "pm@notium.com",      "password": "Notium2024!", "role": "product_manager","name": "Sam Patel" },
]
```

### 4.3 Login Page Design

**Full-screen dark login. Two-column layout:**
- **Left panel (40%):** Deep navy `--bg-base`, Notium branding, tagline, animated abstract background (CSS radial gradients slowly animating)
- **Right panel (60%):** Dark glass card centered, email + password inputs, "Sign In" button with brand glow, role selector (for demo purposes — shows "logging in as: X")
- Input fields: dark background, teal focus ring, no placeholder text (use floating labels instead)
- Error state: red border + shake animation on failed login

### 4.4 JWT Flow

- `POST /api/auth/login` → returns `{ access_token, token_type, user: { id, name, email, role } }`
- Token stored in `localStorage` (for demo) or `httpOnly` cookie
- All protected routes check `Authorization: Bearer <token>` header
- Token expiry: 8 hours
- Refresh: if expired, redirect to login with toast "Session expired, please sign in again"

### 4.5 Route Protection

```typescript
// ProtectedRoute component wraps all authenticated pages
// Redirects to /login if no valid token
// Shows role-specific content based on user.role
```

---

## 5. Data Model & Seed Dataset

### 5.1 Database Schema (SQLAlchemy / SQLite)

**Table: `users`**
```sql
id, email, name, hashed_password, role, created_at, last_login
```

**Table: `financial_records`**
```sql
id, record_date (DATE), product_id, product_name, category, segment,
revenue (FLOAT), cost (FLOAT), profit (FLOAT), discount_rate (FLOAT),
quantity (INTEGER), created_at
```

**Table: `data_uploads`**
```sql
id, filename, uploaded_by, uploaded_at, row_count, quality_score, status
```

**Table: `audit_logs`**
```sql
id, user_id, action, resource, ip_address, timestamp
```

### 5.2 Seed Dataset

Generate a realistic synthetic dataset in `backend/data/seed/seed_data.csv` with:
- **Date range:** January 2022 — December 2024 (36 months)
- **Products:** 8 products across 3 categories

```python
products = [
  { "id": "P001", "name": "Enterprise Suite",    "category": "Software",  "segment": "Enterprise" },
  { "id": "P002", "name": "Analytics Pro",       "category": "Software",  "segment": "Mid-Market" },
  { "id": "P003", "name": "Basic Dashboard",     "category": "Software",  "segment": "SME" },
  { "id": "P004", "name": "Consulting Services", "category": "Services",  "segment": "Enterprise" },
  { "id": "P005", "name": "Training Packages",   "category": "Services",  "segment": "Mid-Market" },
  { "id": "P006", "name": "Hardware Bundle",     "category": "Hardware",  "segment": "Enterprise" },
  { "id": "P007", "name": "Support Contracts",   "category": "Services",  "segment": "SME" },
  { "id": "P008", "name": "Cloud Storage Add-on","category": "Software",  "segment": "Mid-Market" },
]
```

**Realistic data patterns to encode:**
- Enterprise Suite: strong growth trend Jan 2022 → Dec 2024, high margin (~35%)
- Analytics Pro: seasonal peaks in Q4, medium margin (~22%)
- Basic Dashboard: declining trend from mid-2023 (to be flagged as HIGH risk)
- Consulting Services: high revenue, variable margin, discount-sensitive
- Training Packages: low volume, consistent margin
- Hardware Bundle: declining margins due to rising costs (to flag as MEDIUM risk)
- Support Contracts: stable, predictable, LOW risk
- Cloud Storage Add-on: growing fast, lowest margin

**CSV columns:** `record_date,product_id,product_name,category,segment,revenue,cost,profit,discount_rate,quantity`

Generate ~2,400 rows (8 products × 36 months × some variance).

---

## 6. Backend API — Detailed Specification

Base URL: `http://localhost:8000/api`

All endpoints return JSON. All protected endpoints require `Authorization: Bearer <token>` header.

### 6.1 Auth Router (`/api/auth`)

**POST `/api/auth/login`**
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

**GET `/api/auth/me`** — returns current user from token

**POST `/api/auth/logout`** — logs the logout action in audit_logs

---

### 6.2 KPIs Router (`/api/kpis`)

**GET `/api/kpis/summary`**

Query params: `?product=all&segment=all&period_start=2024-01&period_end=2024-12`

```json
// Response
{
  "total_revenue": 4823500.00,
  "total_cost": 3102400.00,
  "total_profit": 1721100.00,
  "profit_margin_pct": 35.68,
  "cost_to_revenue_ratio": 64.32,
  "yoy_growth_pct": 12.4,
  "mom_change_pct": 3.2,
  "data_quality_score": 98.5,
  "last_refreshed": "2024-12-31T23:59:00Z",
  "filters_applied": { "product": "all", "segment": "all", "period": "2024" }
}
```

**GET `/api/kpis/by-product`**

Query params: `?period_start=2024-01&period_end=2024-12`

```json
// Response — array of per-product KPI summaries
[
  {
    "product_id": "P001",
    "product_name": "Enterprise Suite",
    "category": "Software",
    "segment": "Enterprise",
    "revenue": 1200000,
    "cost": 780000,
    "profit": 420000,
    "profit_margin_pct": 35.0,
    "yoy_growth_pct": 18.2,
    "discount_impact_ratio": 0.08,
    "risk_label": "LOW",
    "risk_probability": 0.12
  }
  // ...7 more products
]
```

**GET `/api/kpis/time-series`**

Query params: `?product=P001&granularity=monthly&period_start=2022-01&period_end=2024-12`

```json
// Response
{
  "product": "Enterprise Suite",
  "granularity": "monthly",
  "series": [
    { "period": "2022-01", "revenue": 85000, "cost": 55000, "profit": 30000, "margin_pct": 35.3 }
    // ... more months
  ]
}
```

**GET `/api/kpis/by-segment`**

Returns KPI breakdown by customer segment (Enterprise / Mid-Market / SME).

**POST `/api/kpis/export-pdf`**

Body: `{ "filters": {...}, "include_sections": ["summary", "by_product", "time_series"] }`
Returns: PDF file download

---

### 6.3 Forecast Router (`/api/forecast`)

**GET `/api/forecast/predict`**

Query params: `?product=P001&horizon=3`

```json
// Response 200 — sufficient data (>=6 months)
{
  "product_id": "P001",
  "product_name": "Enterprise Suite",
  "horizon_months": 3,
  "historical": [
    { "period": "2022-01", "actual_profit": 30000 }
    // ... all historical months
  ],
  "forecast": [
    { "period": "2025-01", "predicted_profit": 38500, "lower_bound": 34200, "upper_bound": 42800 },
    { "period": "2025-02", "predicted_profit": 39100, "lower_bound": 34800, "upper_bound": 43400 },
    { "period": "2025-03", "predicted_profit": 40200, "lower_bound": 35600, "upper_bound": 44800 }
  ],
  "at_risk": false,
  "confidence_level": 0.95,
  "model_accuracy": { "mae": 1240.5, "mape": 3.2 },
  "warning": null
}

// Response 200 — insufficient data (<6 months)
{
  "product_id": "P003",
  "warning": "Insufficient data for reliable forecast. At least 6 months of historical data required.",
  "forecast": null
}
```

**GET `/api/forecast/at-risk-products`**

Returns all products flagged as at-risk (predicted decline > 10% in next quarter):

```json
{
  "at_risk_products": [
    { "product_id": "P003", "product_name": "Basic Dashboard", "predicted_decline_pct": -18.4, "next_period": "2025-Q1" }
  ]
}
```

---

### 6.4 Explainer Router (`/api/explain`)

**GET `/api/explain/month-change`**

Query params: `?product=P001&month=2024-11`

```json
// Response 200
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
  "narrative_summary": "Enterprise Suite profit grew by £3,300 (9.4%) in November 2024, driven primarily by a volume increase and a reduction in discount rates.",
  "top_drivers": [
    { "feature": "quantity", "display_name": "Sales Volume", "shap_value": 2100, "direction": "positive", "description": "Unit sales increased by 12%, contributing £2,100 to profit growth." },
    { "feature": "discount_rate", "display_name": "Discount Rate", "shap_value": 890, "direction": "positive", "description": "Average discount reduced from 8.2% to 6.1%, recovering £890 in margin." },
    { "feature": "cost", "display_name": "Operating Cost", "shap_value": -310, "direction": "negative", "description": "Costs rose marginally by £310, partially offsetting the gains." }
  ],
  "exportable": true
}
```

---

### 6.5 Risk Router (`/api/risk`)

**GET `/api/risk/matrix`**

Query params: `?period=2024-Q4`

```json
// Response
{
  "period": "2024-Q4",
  "products": [
    {
      "product_id": "P003",
      "product_name": "Basic Dashboard",
      "risk_label": "HIGH",
      "risk_probability": 0.82,
      "risk_factors": ["Declining profit trend slope", "Rising discount rate", "Falling margins"],
      "recommendation": "Consider reviewing pricing strategy or product discontinuation."
    }
    // ... all products
  ],
  "summary": { "high_count": 1, "medium_count": 2, "low_count": 5 }
}
```

**GET `/api/risk/product/:product_id`**

Returns detailed risk breakdown for a single product with feature importance scores.

---

### 6.6 Simulator Router (`/api/simulator`)

**POST `/api/simulator/run`**

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
  "baseline": {
    "revenue": 100000, "cost": 65000, "profit": 35000, "margin_pct": 35.0
  },
  "scenario": {
    "revenue": 106000, "cost": 61750, "profit": 44250, "margin_pct": 41.7
  },
  "delta": {
    "profit_change": 9250, "profit_change_pct": 26.4, "margin_change_pct": 6.7
  },
  "narrative": "Reducing costs by 5%, cutting discounts by 2 percentage points, growing volume by 10%, and raising prices by 3% is projected to increase Enterprise Suite profit by £9,250 (26.4%), improving margins from 35.0% to 41.7%.",
  "sensitivity": null
}
```

**POST `/api/simulator/sensitivity`**

Sweeps a single parameter across its full range, returning an array of projected profit values for chart rendering.

---

### 6.7 Data Router (`/api/data`)

**POST `/api/data/upload`**

Accepts `multipart/form-data` CSV upload. Validates schema, detects duplicates, calculates quality score, loads into DB.

```json
// Response
{
  "upload_id": "up_12345",
  "filename": "notium_sales_2024.csv",
  "rows_loaded": 480,
  "rows_rejected": 3,
  "quality_score": 99.4,
  "warnings": ["3 rows with missing discount_rate — defaulted to 0"],
  "status": "success"
}
```

**GET `/api/data/quality`** — returns current dataset quality metrics

**GET `/api/data/uploads`** — returns upload history (finance_team only)

---

### 6.8 Audit Router (`/api/audit`)

**GET `/api/audit/logs`** — paginated audit log (finance_team only)

Query params: `?page=1&limit=50&user_id=all&action=all`

---

### 6.9 Health Check

**GET `/api/health`**

```json
{ "status": "healthy", "db": "connected", "models_loaded": true, "timestamp": "2025-01-15T10:00:00Z" }
```

---

## 7. ML Services — Implementation Details

All ML services live in `backend/app/services/` and are loaded once at startup via the FastAPI factory pattern.

### 7.1 Forecaster (`forecaster.py`)

**Algorithm:** Use `statsmodels` SARIMAX or a simple Exponential Smoothing (Holt-Winters) model as a Prophet substitute (Prophet has heavy dependencies). If Prophet is available, use it.

**Implementation:**
```python
class ProfitForecaster:
    def __init__(self):
        self.models = {}  # product_id → fitted model

    def train(self, df: pd.DataFrame):
        # For each product: fit time-series model on monthly profit data
        # Store fitted model in self.models dict

    def forecast(self, product_id: str, horizon: int = 3) -> ForecastResult:
        # Return predicted values + lower/upper confidence bounds
        # Flag at_risk=True if any forecast month shows >10% decline vs last actual

    def flag_at_risk(self, product_id: str) -> bool:
        # Returns True if predicted decline > 10% in next quarter
```

**Training trigger:** Models are trained on startup if pre-trained artifacts don't exist, and re-trained when new data is uploaded.

### 7.2 Explainer (`explainer.py`)

**Algorithm:** XGBoost regressor trained on features `[month_num, quantity, revenue, cost, discount_rate, category_encoded, segment_encoded]` to predict profit. SHAP TreeExplainer to get feature importance per prediction.

```python
class ProfitExplainer:
    def __init__(self):
        self.model = None      # XGBoost model
        self.explainer = None  # SHAP TreeExplainer

    def train(self, df: pd.DataFrame):
        # Feature engineering + XGBoost fit

    def explain(self, product_id: str, month: str) -> ExplanationResult:
        # Get SHAP values for the selected product+month
        # Generate narrative via narrative_generator()

    def narrative_generator(self, shap_dict: dict, profit_change: float, product_name: str) -> str:
        # Rule-based template engine that converts SHAP values → plain English
        # e.g., "Profit grew by £X, driven primarily by [top driver]..."
```

### 7.3 Risk Classifier (`risk_classifier.py`)

**Algorithm:** Random Forest Classifier trained on features:
- `profit_trend_slope` (linear regression slope of last 6 months profit)
- `profit_margin_pct` (current quarter)
- `avg_discount_rate` (current quarter)
- `cost_growth_pct` (quarter-over-quarter cost change)
- `yoy_revenue_change` (year-over-year)

**Labels:** `HIGH` (0), `MEDIUM` (1), `LOW` (2)

**Training:** Use heuristic labeling on seed data:
- Products with profit_trend_slope < -0.05 → HIGH
- Products with profit_trend_slope between -0.05 and 0.02 → MEDIUM
- Products with profit_trend_slope > 0.02 → LOW

```python
class RiskClassifier:
    def __init__(self):
        self.model = None
        self.label_map = {0: "HIGH", 1: "MEDIUM", 2: "LOW"}

    def train(self, df: pd.DataFrame):
        # Feature engineering + RandomForestClassifier fit
        # Save to backend/app/ml/models/risk_classifier.pkl

    def predict_product(self, product_id: str) -> RiskResult:
        # Returns { risk_label, risk_probability, risk_factors }

    def predict_all(self) -> List[RiskResult]:
        # Returns risk for all products
```

### 7.4 What-If Simulator (`simulator.py`)

**Algorithm:** Uses the trained forecaster + a simple linear profit model:

```python
def simulate(product_id: str, adjustments: dict) -> SimResult:
    # 1. Get baseline: last 3-month average revenue, cost, profit, margin
    # 2. Apply adjustments:
    #    new_cost = baseline_cost * (1 + cost_change_pct/100)
    #    new_price_factor = 1 + price_change_pct/100
    #    new_volume_factor = 1 + volume_change_pct/100
    #    new_discount = baseline_discount + discount_rate_change
    #    scenario_revenue = baseline_revenue * new_price_factor * new_volume_factor
    #    scenario_cost = new_cost * new_volume_factor
    #    scenario_profit = scenario_revenue * (1 - new_discount/100) - scenario_cost
    # 3. Generate narrative from delta values
    # 4. Return baseline, scenario, delta, narrative
```

---

## 8. Frontend Pages — Detailed Specification

### 8.1 Login Page (`/login`)

**Layout:** Full screen, dark background, two columns.

**Left panel:**
- Notium logo (SVG, white + teal)
- Platform name in DM Serif Display, large
- Tagline: "From data blindness to profit clarity."
- Three animated stat callouts (fade in staggered):
  - "8 products tracked"
  - "36 months of data"
  - "3 user roles"
- Background: subtle animated radial gradient blobs in navy/teal

**Right panel:**
- Card centered vertically
- "Welcome back" heading
- Floating label email + password inputs
- "Sign In" button (full width, brand teal, glow on hover)
- Below button: "Demo accounts:" with three role chip buttons that auto-fill credentials
- Error toast on invalid credentials

---

### 8.2 Dashboard Page (`/dashboard`) — PRIMARY PAGE

**Purpose:** Financial KPI overview. Default landing page after login.

**Layout:**
```
[Header: "Profitability Overview" | Filter bar | Export PDF button]
[Row 1: 4 KPI Cards]
[Row 2: Revenue + Profit time-series chart (wide) | Margin % pie chart]
[Row 3: Product performance table (full width)]
[Row 4: At-risk alert banner (if any HIGH risk products exist)]
```

**Filter Bar (sticky below header):**
- Product multi-select dropdown (all / individual products)
- Segment dropdown (All / Enterprise / Mid-Market / SME)
- Date range picker (month/year pickers, start → end)
- "Reset Filters" link
- "Last refreshed: Dec 31, 2024" timestamp

**KPI Cards (Row 1):**

Four cards with animated counter numbers:
1. **Total Revenue** — formatted as £X.XM, sparkline (last 12 months)
2. **Total Profit** — formatted as £X.XM, % change badge
3. **Profit Margin %** — large %, trend arrow
4. **YoY Growth** — %, colored green/red

Each card: dark surface, teal top border accent on hover, animated count-up on mount, mini sparkline bottom-right.

**Revenue + Profit Chart (Row 2, left 8 cols):**
- Recharts ComposedChart: Bar (Revenue) + Line (Profit) + Line (Margin %)
- Dual Y-axis (left: £ values, right: % values)
- Custom tooltip (dark glass, shows all three values)
- Legend at top
- Brush/zoom control at bottom

**Segment Breakdown (Row 2, right 4 cols):**
- Recharts RadialBarChart or PieChart
- Segments: Enterprise / Mid-Market / SME
- Colors: teal / sky / amber
- Centre label: total

**Product Performance Table (Row 3):**
- Columns: Product | Category | Segment | Revenue | Cost | Profit | Margin% | YoY | Risk
- Sortable columns
- Risk column shows `<RiskBadge />` component
- Row click → navigates to `/forecast?product=P00X`
- Export to PDF button

**At-Risk Alert Banner (Row 4, conditionally shown):**
- Red-tinted card
- "⚠ 1 product flagged as HIGH risk this quarter: Basic Dashboard"
- "View Risk Matrix →" link

---

### 8.3 Forecast Page (`/forecast`)

**Purpose:** Predictive profit forecast per product.

**Layout:**
```
[Header: "Profit Forecast" | Product selector]
[Forecast chart (full width)]
[Row: Forecast summary cards (3) | Data sufficiency warning if applicable]
[At-risk product alert strip]
```

**Product Selector:**
- Large dropdown/tabs showing all 8 products
- Shows current risk badge next to product name

**Forecast Chart:**
- Recharts ComposedChart (full width, 400px height)
- Area: historical profit (teal fill, 40% opacity)
- Line: historical actuals (solid teal)
- Dashed line: forecasted profit (dashed white/teal)
- Area band: confidence interval (lower → upper, subtle fill)
- Vertical dashed line: "Today" marker
- Custom tooltip: shows actual vs forecast + confidence bounds
- If at_risk=true: red zone overlay for declining forecast periods

**Forecast Summary Cards (3 cards):**
- "Next Month Forecast" — predicted value + confidence range
- "3-Month Outlook" — cumulative projection
- "Model Accuracy" — MAPE %

**Insufficient Data Warning:**
- Amber card with icon: "Insufficient historical data — at least 6 months required for a reliable forecast."

---

### 8.4 Explainer Page (`/explainer`)

**Purpose:** Plain-English explanation of month-on-month profit change.

**Layout:**
```
[Header: "Profit Change Analysis" | Product + Month selectors]
[Narrative card (prominent, full-width)]
[Row: SHAP waterfall chart | Top drivers list]
[Export PDF button]
```

**Product + Month Selectors:**
- Product dropdown
- Month picker (list of available months, defaults to most recent)

**Narrative Card:**
- Large, prominent card
- Brand teal left border (4px)
- Serif font for the narrative text
- Direction badge: "↑ Profit increased" (green) or "↓ Profit decreased" (red)
- Large profit change number prominent

**SHAP Waterfall Chart (custom):**
- Horizontal bar chart (Recharts)
- Bars extend right (positive, teal) or left (negative, red) from a centre baseline
- Y-axis: feature display names
- X-axis: SHAP value in £
- Sorted by absolute impact

**Top Drivers List:**
- 3 cards, numbered 1/2/3
- Each: feature name (bold), direction icon (↑/↓), impact value (£), description text
- Green/red color per direction

---

### 8.5 Risk Matrix Page (`/risk`)

**Purpose:** Product risk classification overview.

**Layout:**
```
[Header: "Product Risk Matrix" | Quarter selector]
[Risk summary strip: HIGH: X | MEDIUM: X | LOW: X]
[2x4 grid of product risk cards]
[Full risk detail table below]
```

**Risk Summary Strip:**
- Three stat blocks: HIGH count (red), MEDIUM count (amber), LOW count (teal)
- "Updated for Q4 2024"

**Product Risk Cards (2×4 grid):**
Each card:
- Product name + category badge
- Large risk badge (HIGH / MEDIUM / LOW) — colored, prominent
- Risk probability bar (thin progress bar)
- "Risk factors:" — 2-3 bullet points
- "View details →" link

- HIGH risk cards: subtle red glow border
- LOW risk cards: subtle teal glow border

**Risk Detail Table:**
- Columns: Product | Risk | Probability | Trend Slope | Margin% | Discount Rate | Cost Growth | Recommendation
- Sortable
- Export PDF option

---

### 8.6 Simulator Page (`/simulator`)

**Purpose:** Interactive What-If scenario simulation.

**Layout:**
```
[Header: "What-If Scenario Simulator" | Product selector]
[Two columns: Left = sliders | Right = results]
[Sensitivity chart (full width)]
```

**Left Panel — Sliders:**
- Product selector at top
- Four sliders with live values:
  - **Cost Change %** — range: -30% to +30%, step 0.5%
  - **Discount Rate Change** — range: -5% to +5%, step 0.1%
  - **Volume Change %** — range: -30% to +30%, step 1%
  - **Price Change %** — range: -20% to +20%, step 0.5%
- "Run Simulation" button (brand teal)
- "Reset All" link

Each slider: custom styled (teal track, white thumb), shows current value above thumb.

**Right Panel — Results:**
- Shows after "Run Simulation" is clicked
- Animated entrance (Framer Motion)
- Side-by-side: Baseline vs Scenario metric cards
  - Revenue: £X vs £Y (↑ +Z%)
  - Cost: £X vs £Y (↓ -Z%)
  - Profit: £X vs £Y (↑ +Z%)
  - Margin%: X% vs Y%
- Large profit delta (DM Serif Display, teal if positive, red if negative)
- Narrative text panel (same style as explainer page)

**Sensitivity Chart:**
- "Show Sensitivity Analysis" expandable section
- Selects ONE parameter to sweep
- Recharts LineChart: X-axis = parameter values, Y-axis = projected profit
- Vertical line: current scenario value

---

### 8.7 Settings / Data Page (`/settings`)

**Purpose:** Data management, upload, and system info. Accessible to finance_team.

**Tabs:** Data Upload | Data Quality | Upload History | Audit Log (finance_team only)

**Data Upload Tab:**
- Drag-and-drop zone: dark dashed border, cloud icon, "Drop your CSV here or click to browse"
- File requirements listed: columns required, date format
- Upload progress bar
- Post-upload: quality report card (rows loaded, rejected, quality score, warnings)

**Data Quality Tab:**
- Quality score (large %, animated radial chart)
- Breakdown: completeness %, duplicate rate, invalid values count
- Data freshness: "Last updated: X days ago"

**Audit Log Tab (finance_team only):**
- Filterable table: User | Action | Resource | IP | Timestamp
- Paginated, 50 rows/page

---

### 8.8 Sidebar Navigation

**Fixed left sidebar (240px, collapsible to 64px):**

```
[Notium logo + "PIP" wordmark]
[Collapse toggle button →]

Navigation items:
  📊  Dashboard          /dashboard
  📈  Forecast           /forecast
  💬  Explainer          /explainer
  🛡️  Risk Matrix        /risk
  🧪  What-If Simulator  /simulator
  ⚙️  Settings / Data    /settings

[Bottom section:]
  [User avatar + name + role badge]
  [Sign Out button]
```

**Active state:** Teal left border (3px), teal text, brand-dim background
**Hover state:** `--bg-elevated` background, smooth transition
**Collapsed mode:** Icons only with tooltips on hover
**Role restrictions:** Settings item only shows for `finance_team`

---

### 8.9 Header Component

**Fixed top, 56px height:**
- Left: Page title (breadcrumb)
- Center: Data freshness indicator ("Data as of Dec 31, 2024 · Updated 2 hours ago")
- Right: Notifications bell (badge if at-risk products exist) | User avatar dropdown

**Notifications dropdown:**
- Shows at-risk product alerts
- Shows data quality warnings
- Dark glass panel, max 5 items

---

## 9. State Management (Zustand)

```typescript
// store/authStore.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// store/filterStore.ts
interface FilterStore {
  selectedProduct: string;   // 'all' | product_id
  selectedSegment: string;   // 'all' | 'Enterprise' | 'Mid-Market' | 'SME'
  dateRange: { start: string; end: string };
  setProduct: (p: string) => void;
  setSegment: (s: string) => void;
  setDateRange: (range: { start: string; end: string }) => void;
  resetFilters: () => void;
}

// store/uiStore.ts
interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeNotifications: Notification[];
  addNotification: (n: Notification) => void;
}
```

---

## 10. API Client (TanStack Query)

```typescript
// api/kpis.ts — example pattern for all API modules
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from './client';

export const useKPISummary = (filters: KPIFilters) =>
  useQuery({
    queryKey: ['kpis', 'summary', filters],
    queryFn: () => axios.get('/kpis/summary', { params: filters }).then(r => r.data),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    retry: 2
  });

// All queries follow this pattern
// Mutations use useMutation with onSuccess/onError toasts
```

---

## 11. Error Handling & Edge Cases

### 11.1 Frontend

- **API errors:** Caught by TanStack Query, displayed as toast notifications
- **Network offline:** Show "Connection lost — showing cached data" banner
- **Empty data states:** Every page has a designed empty state (not blank screen)
- **Loading states:** Skeleton loaders matching the content shape (not spinners)
- **Auth expiry:** 401 response → clear token → redirect to `/login` → toast "Session expired"
- **Role restrictions:** If a `product_manager` tries to access Settings, show "Access restricted" page

### 11.2 Backend

- **All endpoints wrapped in try/except** with appropriate HTTP status codes
- **Validation errors:** Pydantic returns `422 Unprocessable Entity` with field details
- **ML model errors:** If model unavailable, return cached results + `"warning": "Using cached model from [timestamp]"`
- **Data quality warnings:** Logged and returned in API responses
- **CORS:** Allow `http://localhost:5173` in development

---

## 12. PDF Export

Two export options:

**1. KPI Summary PDF** (`/api/kpis/export-pdf`):
- Server-side via `reportlab` or `weasyprint`
- Notium branding header
- KPI table, time-series chart (as image)
- Disclaimer footer: "This report is for decision support only."

**2. Narrative Insight PDF** (client-side via `jsPDF + html2canvas`):
- Captures the narrative card + drivers list
- Exports as styled PDF with Notium branding

---

## 13. Testing

### 13.1 Backend Tests (`pytest`)

Minimum 80% unit test coverage. Test files in `backend/tests/`:

```
test_auth.py          — login, token generation, token validation
test_kpis.py          — KPI calculations, time-series aggregation
test_forecaster.py    — model training, prediction output shape, at-risk flagging
test_explainer.py     — SHAP output, narrative generation
test_risk.py          — classifier output, label mapping
test_simulator.py     — simulation arithmetic, edge cases (zero volume, negative profit)
test_data_upload.py   — CSV validation, quality scoring, duplicate detection
```

Run with: `pytest backend/tests/ --cov=app --cov-report=term-missing`

### 13.2 Frontend

- TypeScript strict mode catches type errors at compile time
- Component prop types enforced throughout

---

## 14. Environment Configuration

### 14.1 Backend `.env`

```env
# backend/.env
DATABASE_URL=sqlite:///./notium.db
SECRET_KEY=your-secret-key-change-in-production-minimum-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
CORS_ORIGINS=http://localhost:5173
ENVIRONMENT=development
SEED_ON_STARTUP=true
RETRAIN_MODELS_ON_STARTUP=true
```

### 14.2 Frontend `.env`

```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Notium PIP
```

---

## 15. Setup & Run Instructions

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m app.utils.seed_data  # Seeds DB + trains ML models
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev  # Starts on http://localhost:5173
```

### First Run

On `SEED_ON_STARTUP=true`:
1. Creates SQLite DB and runs Alembic migrations
2. Seeds `financial_records` from `data/seed/seed_data.csv`
3. Creates 3 demo users
4. Trains and persists all ML models to `app/ml/models/`

---

## 16. README.md Requirements

The README.md must include:
1. Project title + BCU module details
2. Team member names + student IDs
3. Problem statement (2 sentences)
4. Solution overview (bullet points)
5. Full setup instructions (copy-paste ready)
6. Demo accounts table (email, password, role)
7. API documentation link (FastAPI auto-docs at `/docs`)
8. Architecture diagram (ASCII or Mermaid)
9. Technologies used
10. Known limitations / future work

---

## 17. Quality Checklist

Before considering the application complete, verify every item:

**Functionality:**
- [ ] Login works for all 3 demo accounts
- [ ] Filters on dashboard update all charts and KPI cards
- [ ] Forecast chart renders with historical + forecast + confidence bands
- [ ] Explainer page generates narrative and SHAP waterfall chart
- [ ] Risk matrix shows all 8 products with correct risk labels
- [ ] What-If simulator produces results on slider adjustment + "Run Simulation"
- [ ] CSV upload works and triggers model retraining
- [ ] PDF export downloads correctly

**UI/UX:**
- [ ] Dark theme consistent across all pages
- [ ] No light backgrounds / white flashes on navigation
- [ ] Animations run smoothly (60fps) — no jank
- [ ] Loading skeletons appear before data loads
- [ ] Empty states designed and visible
- [ ] Mobile-responsive (tablet breakpoint: 768px)
- [ ] All text readable (contrast ratio ≥ 4.5:1)
- [ ] Sidebar collapse/expand works

**Code Quality:**
- [ ] No TypeScript errors (`npm run tsc --noEmit`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] All API calls use TanStack Query (no raw `useEffect` fetches)
- [ ] No hardcoded credentials or API URLs in source
- [ ] Backend tests pass at ≥80% coverage
- [ ] No console errors in browser

---

## 18. Stretch Goals (implement if time permits)

1. **Dark/light mode toggle** — persisted in localStorage
2. **Real-time notifications** — WebSocket endpoint pushing at-risk alerts
3. **Data upload wizard** — multi-step with column mapping UI
4. **Comparison mode** — compare two products side-by-side on the forecast page
5. **Drill-down charts** — click a bar to zoom into that month's breakdown
6. **User management page** — admin creates/deactivates user accounts
7. **Scheduled email reports** — mock endpoint that would send PDF summary weekly
8. **Keyboard shortcuts** — `G D` → dashboard, `G F` → forecast, etc.

---

*End of specification. Total estimated lines of code: ~8,000–12,000. Estimated build time with Claude Code: 2–4 hours with this spec.*

*Module: CMP5354 Software Design · Birmingham City University · Group D2*
*Rajveer Singh Saini · Nitish Chowdary Yaralagadda · Amogh Dath Kalasapura Arunkumar · Simranjit Kaur*
