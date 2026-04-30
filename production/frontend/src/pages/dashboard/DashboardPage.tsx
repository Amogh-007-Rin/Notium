import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, Brush,
} from 'recharts';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { useKPISummary, useKPIByProduct, useKPITimeSeries, useKPIBySegment, useExportPDF } from '@/api/kpis';
import { useAtRiskProducts } from '@/api/forecast';
import { useFilterStore } from '@/store/filterStore';
import { KPICard } from '@/components/shared/KPICard';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { SkeletonCard, SkeletonChart, SkeletonRow } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { DarkTooltip } from '@/components/charts/ChartTooltip';
import { formatCurrency, formatPct, formatPctNoSign, formatPeriod } from '@/utils/format';
import toast from 'react-hot-toast';

const PRODUCTS = [
  { value: 'all', label: 'All Products' },
  { value: 'P001', label: 'Enterprise Suite' },
  { value: 'P002', label: 'Analytics Pro' },
  { value: 'P003', label: 'Basic Dashboard' },
  { value: 'P004', label: 'Consulting Services' },
  { value: 'P005', label: 'Training Packages' },
  { value: 'P006', label: 'Hardware Bundle' },
  { value: 'P007', label: 'Support Contracts' },
  { value: 'P008', label: 'Cloud Storage Add-on' },
];

const SEGMENTS = ['all', 'Enterprise', 'Mid-Market', 'SME'];
const SEG_COLORS = { Enterprise: '#00C896', 'Mid-Market': '#0EA5E9', SME: '#F59E0B' };

export function DashboardPage() {
  const navigate = useNavigate();
  const { selectedProduct, selectedSegment, dateRange, setProduct, setSegment, setDateRange, resetFilters } = useFilterStore();

  const filters = {
    product: selectedProduct,
    segment: selectedSegment,
    period_start: dateRange.start,
    period_end: dateRange.end,
  };

  const { data: summary, isLoading: loadSummary, refetch } = useKPISummary(filters);
  const { data: byProduct, isLoading: loadProducts } = useKPIByProduct(filters);
  const { data: timeSeries, isLoading: loadTS } = useKPITimeSeries({ ...filters, granularity: 'monthly' });
  const { data: bySegment, isLoading: loadSeg } = useKPIBySegment(filters);
  const { data: atRisk } = useAtRiskProducts();
  const { mutate: exportPDF, isPending: exporting } = useExportPDF();

  const [sortCol, setSortCol] = useState<string>('revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const sortedProducts = [...(byProduct ?? [])].sort((a, b) => {
    const aVal = (a as any)[sortCol] ?? 0;
    const bVal = (b as any)[sortCol] ?? 0;
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const sparklineData = timeSeries?.series.slice(-12).map(s => s.profit) ?? [];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-3 p-4 rounded-xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <select
          value={selectedProduct}
          onChange={(e) => setProduct(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          {PRODUCTS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <select
          value={selectedSegment}
          onChange={(e) => setSegment(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          {SEGMENTS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Segments' : s}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <input
            type="month"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
        </div>

        <button
          onClick={resetFilters}
          className="text-sm px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          Reset Filters
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => exportPDF()}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--brand-primary)', color: '#000', opacity: exporting ? 0.7 : 1 }}
          >
            <Download size={14} />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* At-Risk Banner */}
      {atRisk && atRisk.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              <strong style={{ color: 'var(--danger)' }}>{atRisk.length} product{atRisk.length > 1 ? 's' : ''}</strong>{' '}
              flagged as HIGH risk:{' '}
              {atRisk.map((p) => p.product_name).join(', ')}
            </span>
          </div>
          <button
            onClick={() => navigate('/risk')}
            className="text-sm font-medium transition-colors"
            style={{ color: 'var(--danger)' }}
          >
            View Risk Matrix →
          </button>
        </motion.div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadSummary ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} height={130} />)
        ) : summary ? (
          <>
            <KPICard
              label="Total Revenue"
              value={formatCurrency(summary.total_revenue, true)}
              change={summary.yoy_growth_pct}
              changeLabel="YoY"
              sparklineData={sparklineData}
              delay={0}
            />
            <KPICard
              label="Total Profit"
              value={formatCurrency(summary.total_profit, true)}
              change={summary.mom_change_pct}
              changeLabel="MoM"
              sparklineData={sparklineData}
              delay={0.07}
            />
            <KPICard
              label="Profit Margin"
              value={formatPctNoSign(summary.profit_margin_pct)}
              change={summary.mom_change_pct}
              delay={0.14}
            />
            <KPICard
              label="YoY Growth"
              value={formatPct(summary.yoy_growth_pct)}
              delay={0.21}
            />
          </>
        ) : (
          <div className="col-span-4">
            <EmptyState title="No KPI data" description="No financial records found for the selected filters." />
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue + Profit Chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Revenue & Profit Trend
          </h2>
          {loadTS ? (
            <div className="skeleton" style={{ height: 280 }} />
          ) : timeSeries?.series.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={timeSeries.series} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="period" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={formatPeriod} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, true)} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="rgba(14,165,233,0.4)" radius={[2, 2, 0, 0]} animationBegin={0} animationDuration={1200} />
                <Line yAxisId="left" type="monotone" dataKey="profit" name="Profit" stroke="var(--brand-primary)" strokeWidth={2} dot={false} animationBegin={0} animationDuration={1200} />
                <Line yAxisId="right" type="monotone" dataKey="margin_pct" name="Margin %" stroke="#F59E0B" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                <Brush dataKey="period" height={20} stroke="var(--border-subtle)" fill="var(--bg-elevated)" travellerWidth={6} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState description="No time-series data for selected period." />
          )}
        </div>

        {/* Segment Breakdown */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Segment Breakdown
          </h2>
          {loadSeg ? (
            <div className="skeleton" style={{ height: 240 }} />
          ) : bySegment?.length ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={bySegment}
                    dataKey="revenue"
                    nameKey="segment"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    strokeWidth={0}
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {bySegment.map((entry) => (
                      <Cell key={entry.segment} fill={(SEG_COLORS as any)[entry.segment] ?? '#8B9CBB'} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ payload }) =>
                      payload?.[0] ? (
                        <div className="glass rounded-lg p-2 text-xs">
                          <div style={{ color: 'var(--text-primary)' }}>{payload[0].name}</div>
                          <div style={{ color: 'var(--brand-primary)' }}>{formatCurrency(payload[0].value as number, true)}</div>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {bySegment.map((s) => (
                  <div key={s.segment} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: (SEG_COLORS as any)[s.segment] ?? '#8B9CBB' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{s.segment}</span>
                    </div>
                    <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(s.revenue, true)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState description="No segment data available." />
          )}
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Product Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                {['product_name', 'category', 'segment', 'revenue', 'cost', 'profit', 'profit_margin_pct', 'yoy_growth_pct', 'risk_label'].map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-4 py-3 text-left cursor-pointer select-none text-xs font-semibold uppercase tracking-wide transition-colors"
                    style={{
                      color: sortCol === col ? 'var(--brand-primary)' : 'var(--text-muted)',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {col.replace('_', ' ').replace('pct', '%')}
                    {sortCol === col && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadProducts ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={9}><SkeletonRow /></td></tr>
                ))
              ) : sortedProducts.length ? (
                sortedProducts.map((p, idx) => (
                  <tr
                    key={p.product_id}
                    onClick={() => navigate(`/forecast?product=${p.product_id}`)}
                    className="cursor-pointer transition-colors"
                    style={{
                      background: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--brand-dim)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)')}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{p.product_name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.category}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.segment}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.revenue, true)}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(p.cost, true)}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--brand-primary)' }}>{formatCurrency(p.profit, true)}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-primary)' }}>{formatPctNoSign(p.profit_margin_pct)}</td>
                    <td className="px-4 py-3 font-mono" style={{ color: p.yoy_growth_pct >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {formatPct(p.yoy_growth_pct)}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge label={p.risk_label} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={9}><EmptyState description="No product data for selected filters." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
