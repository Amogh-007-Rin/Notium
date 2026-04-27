import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { AlertCircle, TrendingDown } from 'lucide-react';
import { useForecast, useAtRiskProducts } from '@/api/forecast';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { SkeletonChart } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatPctNoSign, formatPeriod } from '@/utils/format';

const PRODUCTS = [
  { value: 'P001', label: 'Enterprise Suite', risk: 'LOW' as const },
  { value: 'P002', label: 'Analytics Pro', risk: 'LOW' as const },
  { value: 'P003', label: 'Basic Dashboard', risk: 'HIGH' as const },
  { value: 'P004', label: 'Consulting Services', risk: 'MEDIUM' as const },
  { value: 'P005', label: 'Training Packages', risk: 'LOW' as const },
  { value: 'P006', label: 'Hardware Bundle', risk: 'MEDIUM' as const },
  { value: 'P007', label: 'Support Contracts', risk: 'LOW' as const },
  { value: 'P008', label: 'Cloud Storage Add-on', risk: 'LOW' as const },
];

const HORIZONS = [1, 3, 6, 12];

interface ChartDataPoint {
  period: string;
  actual?: number;
  forecast?: number;
  lower?: number;
  upper?: number;
}

export function ForecastPage() {
  const [params] = useSearchParams();
  const [product, setProduct] = useState(params.get('product') ?? 'P001');
  const [horizon, setHorizon] = useState(3);

  const { data, isLoading, isError } = useForecast(product, horizon);
  const { data: atRisk } = useAtRiskProducts();

  const chartData: ChartDataPoint[] = [
    ...(data?.historical ?? []).map((h) => ({ period: h.period, actual: h.actual_profit })),
    ...(data?.forecast ?? []).map((f) => ({
      period: f.period,
      forecast: f.predicted_profit,
      lower: f.lower_bound,
      upper: f.upper_bound,
    })),
  ];

  const lastActual = data?.historical?.slice(-1)[0]?.actual_profit;
  const firstForecast = data?.forecast?.[0];
  const threeMonthTotal = data?.forecast?.reduce((s, f) => s + f.predicted_profit, 0) ?? 0;

  const productRisk = PRODUCTS.find((p) => p.value === product)?.risk ?? 'LOW';

  return (
    <div className="space-y-6">
      {/* Product selector */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm outline-none font-medium"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          {PRODUCTS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <RiskBadge label={productRisk} size="md" />

        <div className="flex items-center gap-1 ml-auto">
          <span className="text-sm mr-2" style={{ color: 'var(--text-muted)' }}>Horizon:</span>
          {HORIZONS.map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className="px-3 py-1.5 rounded-lg text-sm font-mono transition-all"
              style={{
                background: horizon === h ? 'var(--brand-primary)' : 'var(--bg-surface)',
                color: horizon === h ? '#000' : 'var(--text-secondary)',
                border: `1px solid ${horizon === h ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              }}
            >
              {h}m
            </button>
          ))}
        </div>
      </div>

      {/* Warning */}
      {data?.warning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{data.warning}</span>
        </motion.div>
      )}

      {/* At-risk alert */}
      {data?.at_risk && !data.warning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <TrendingDown size={18} style={{ color: 'var(--danger)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <strong style={{ color: 'var(--danger)' }}>Profit at risk</strong> — forecast shows &gt;10% decline in the next {horizon} month{horizon > 1 ? 's' : ''}.
          </span>
        </motion.div>
      )}

      {/* Forecast Chart */}
      <div className="card p-5">
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {data?.product_name ?? PRODUCTS.find((p) => p.value === product)?.label} — Profit Forecast
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Historical actuals + {horizon}-month forecast with 95% confidence band
        </p>

        {isLoading ? (
          <div className="skeleton" style={{ height: 380 }} />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="period" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatPeriod} interval="preserveStartEnd" />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, true)} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="glass rounded-lg p-3 text-xs space-y-1">
                      <div className="font-mono mb-1" style={{ color: 'var(--text-muted)' }}>{formatPeriod(label)}</div>
                      {payload.map((item: any) => item.value != null && (
                        <div key={item.dataKey} className="flex gap-3 justify-between">
                          <span style={{ color: item.color }}>{item.name}</span>
                          <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(item.value as number, true)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {/* Confidence band area */}
              <Area
                type="monotone"
                dataKey="upper"
                name="Upper bound"
                stroke="transparent"
                fill="rgba(0,200,150,0.08)"
                animationBegin={0}
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="lower"
                name="Lower bound"
                stroke="transparent"
                fill="var(--bg-base)"
                animationBegin={0}
                animationDuration={1000}
              />
              {/* Historical actual */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Profit"
                stroke="var(--brand-primary)"
                strokeWidth={2}
                dot={{ r: 2, fill: 'var(--brand-primary)' }}
                connectNulls={false}
                animationBegin={0}
                animationDuration={1200}
              />
              {/* Forecast line */}
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecast"
                stroke="var(--brand-secondary)"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 3, fill: 'var(--brand-secondary)' }}
                connectNulls={false}
                animationBegin={0}
                animationDuration={1200}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState description="No forecast data available for this product." />
        )}
      </div>

      {/* Summary Cards */}
      {!data?.warning && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5"
          >
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Next Month Forecast</p>
            <p className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-primary)' }}>
              {firstForecast ? formatCurrency(firstForecast.predicted_profit, true) : '—'}
            </p>
            {firstForecast && (
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {formatCurrency(firstForecast.lower_bound, true)} — {formatCurrency(firstForecast.upper_bound, true)} (95% CI)
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="card p-5"
          >
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
              {horizon}-Month Outlook
            </p>
            <p className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {formatCurrency(threeMonthTotal, true)}
            </p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              Cumulative projected profit
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
            className="card p-5"
          >
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Model Accuracy</p>
            <p className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {data?.model_accuracy ? formatPctNoSign(data.model_accuracy.mape) : '—'}
            </p>
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              MAPE · MAE: {data?.model_accuracy ? formatCurrency(data.model_accuracy.mae, true) : '—'}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
