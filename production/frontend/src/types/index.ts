export interface User {
  id: number;
  name: string;
  email: string;
  role: 'decision_maker' | 'finance_team' | 'product_manager';
}

export interface KPISummary {
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  profit_margin_pct: number;
  cost_to_revenue_ratio: number;
  yoy_growth_pct: number;
  mom_change_pct: number;
  data_quality_score: number;
  last_refreshed: string;
  filters_applied: Record<string, string>;
}

export interface ProductKPI {
  product_id: string;
  product_name: string;
  category: string;
  segment: string;
  revenue: number;
  cost: number;
  profit: number;
  profit_margin_pct: number;
  yoy_growth_pct: number;
  discount_impact_ratio: number;
  risk_label: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_probability: number;
}

export interface TimeSeriesPoint {
  period: string;
  revenue: number;
  cost: number;
  profit: number;
  margin_pct: number;
}

export interface ForecastPoint {
  period: string;
  predicted_profit: number;
  lower_bound: number;
  upper_bound: number;
}

export interface HistoricalPoint {
  period: string;
  actual_profit: number;
}

export interface ForecastResponse {
  product_id: string;
  product_name: string;
  horizon_months: number;
  historical: HistoricalPoint[];
  forecast: ForecastPoint[] | null;
  at_risk: boolean;
  confidence_level: number;
  model_accuracy: { mae: number; mape: number };
  warning: string | null;
}

export interface DriverDetail {
  feature: string;
  display_name: string;
  shap_value: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface ExplanationResponse {
  product_id: string;
  product_name: string;
  month: string;
  previous_month: string;
  actual_profit: number;
  previous_profit: number;
  profit_change: number;
  profit_change_pct: number;
  direction: 'increase' | 'decrease';
  narrative_summary: string;
  top_drivers: DriverDetail[];
  exportable: boolean;
}

export interface RiskProduct {
  product_id: string;
  product_name: string;
  risk_label: 'HIGH' | 'MEDIUM' | 'LOW';
  risk_probability: number;
  risk_factors: string[];
  recommendation: string;
}

export interface RiskMatrixResponse {
  period: string;
  products: RiskProduct[];
  summary: { high_count: number; medium_count: number; low_count: number };
}

export interface SimulatorAdjustments {
  cost_change_pct: number;
  discount_rate_change: number;
  volume_change_pct: number;
  price_change_pct: number;
}

export interface MetricsSnapshot {
  revenue: number;
  cost: number;
  profit: number;
  margin_pct: number;
}

export interface SimulatorResponse {
  product_id: string;
  product_name: string;
  baseline: MetricsSnapshot;
  scenario: MetricsSnapshot;
  delta: { profit_change: number; profit_change_pct: number; margin_change_pct: number };
  narrative: string;
  sensitivity: null | Array<{ parameter_value: number; projected_profit: number }>;
}

export interface SegmentKPI {
  segment: string;
  revenue: number;
  cost: number;
  profit: number;
  profit_margin_pct: number;
  product_count: number;
}

export interface AtRiskProduct {
  product_id: string;
  product_name: string;
  predicted_decline_pct: number;
  next_period: string;
}

export type RiskLabel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Notification {
  id: string;
  type: 'risk' | 'quality' | 'info';
  message: string;
  timestamp: Date;
  read: boolean;
}
