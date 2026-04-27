import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { useExplanation } from '@/api/explain';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatCurrency, formatPct } from '@/utils/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PRODUCTS = [
  { value: 'P001', label: 'Enterprise Suite' },
  { value: 'P002', label: 'Analytics Pro' },
  { value: 'P003', label: 'Basic Dashboard' },
  { value: 'P004', label: 'Consulting Services' },
  { value: 'P005', label: 'Training Packages' },
  { value: 'P006', label: 'Hardware Bundle' },
  { value: 'P007', label: 'Support Contracts' },
  { value: 'P008', label: 'Cloud Storage Add-on' },
];

const MONTHS: { value: string; label: string }[] = [];
for (let y = 2024; y >= 2022; y--) {
  for (let m = y === 2024 ? 12 : 12; m >= 1; m--) {
    const mo = String(m).padStart(2, '0');
    MONTHS.push({ value: `${y}-${mo}`, label: `${new Date(y, m - 1).toLocaleString('en', { month: 'short' })} ${y}` });
    if (y === 2022 && m === 1) break;
  }
}

export function ExplainerPage() {
  const [product, setProduct] = useState('P001');
  const [month, setMonth] = useState('2024-12');

  const { data, isLoading, isError } = useExplanation(product, month);

  const isPositive = data?.direction === 'increase';

  const exportPDF = async () => {
    const el = document.getElementById('narrative-export');
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: '#080C14', scale: 2 });
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`notium-explainer-${product}-${month}.pdf`);
  };

  const waterfallData = data?.top_drivers.map((d) => ({
    name: d.display_name,
    value: d.shap_value,
    direction: d.direction,
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          {PRODUCTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        {data?.exportable && (
          <button
            onClick={exportPDF}
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
          >
            <Download size={14} />
            Export PDF
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="skeleton rounded-xl" style={{ height: 140 }} />
          <div className="grid grid-cols-2 gap-4">
            <div className="skeleton rounded-xl" style={{ height: 240 }} />
            <div className="skeleton rounded-xl" style={{ height: 240 }} />
          </div>
        </div>
      ) : isError || !data ? (
        <EmptyState
          title="No explanation available"
          description="Select a product and month with at least 2 months of data to generate an explanation."
        />
      ) : (
        <div id="narrative-export" className="space-y-6">
          {/* Narrative Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl"
            style={{
              background: 'var(--bg-surface)',
              borderLeft: `4px solid ${isPositive ? 'var(--success)' : 'var(--danger)'}`,
              border: `1px solid var(--border-subtle)`,
              borderLeftWidth: 4,
              borderLeftColor: isPositive ? 'var(--success)' : 'var(--danger)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: isPositive ? 'rgba(0,200,150,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isPositive ? 'var(--success)' : 'var(--danger)',
                }}
              >
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {isPositive ? '↑ Profit increased' : '↓ Profit decreased'}
              </div>
              <span className="text-2xl font-display" style={{ fontFamily: 'var(--font-display)', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                {formatCurrency(Math.abs(data.profit_change), true)}
              </span>
              <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                ({formatPct(data.profit_change_pct)})
              </span>
            </div>

            <p className="text-base leading-relaxed" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 18 }}>
              {data.narrative_summary}
            </p>

            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Profit in {data.month}</p>
                <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(data.actual_profit)}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Profit in {data.previous_month}</p>
                <p className="font-mono font-semibold" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(data.previous_profit)}</p>
              </div>
            </div>
          </motion.div>

          {/* SHAP Waterfall + Drivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Waterfall Chart */}
            <div className="card p-5">
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Impact Breakdown (SHAP Values)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={waterfallData} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, true)} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={100} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const val = payload[0].value as number;
                      return (
                        <div className="glass rounded-lg p-2 text-xs">
                          <div style={{ color: val >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {formatCurrency(val)}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine x={0} stroke="var(--border-default)" />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]} animationBegin={0} animationDuration={800}>
                    {waterfallData.map((entry, i) => (
                      <Cell key={i} fill={entry.direction === 'positive' ? 'var(--success)' : 'var(--danger)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Drivers */}
            <div className="card p-5">
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Top Profit Drivers
              </h3>
              <div className="space-y-4">
                {data.top_drivers.map((driver, i) => (
                  <motion.div
                    key={driver.feature}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: driver.direction === 'positive' ? 'rgba(0,200,150,0.15)' : 'rgba(239,68,68,0.15)',
                        color: driver.direction === 'positive' ? 'var(--success)' : 'var(--danger)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {driver.display_name}
                        </span>
                        <span
                          className="text-xs font-mono"
                          style={{ color: driver.direction === 'positive' ? 'var(--success)' : 'var(--danger)' }}
                        >
                          {driver.direction === 'positive' ? '↑' : '↓'} {formatCurrency(Math.abs(driver.shap_value), true)}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{driver.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
