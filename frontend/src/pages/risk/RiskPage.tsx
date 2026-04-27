import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRiskMatrix } from '@/api/risk';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatPctNoSign } from '@/utils/format';
import type { RiskProduct } from '@/types';

const PERIODS = ['2024-Q4', '2024-Q3', '2024-Q2', '2024-Q1', '2023-Q4'];

export function RiskPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('2024-Q4');
  const [sortCol, setSortCol] = useState('risk_probability');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useRiskMatrix(period);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('desc'); }
  };

  const sorted = [...(data?.products ?? [])].sort((a: any, b: any) => {
    const av = a[sortCol] ?? '';
    const bv = b[sortCol] ?? '';
    if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 } as Record<string, number>;
  const cardProducts = [...(data?.products ?? [])].sort(
    (a, b) => (riskOrder[a.risk_label] ?? 2) - (riskOrder[b.risk_label] ?? 2)
  );

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Summary strip */}
      {data && (
        <div className="grid grid-cols-3 gap-3">
          {([
            { label: 'HIGH Risk', count: data.summary.high_count, color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
            { label: 'MEDIUM Risk', count: data.summary.medium_count, color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
            { label: 'LOW Risk', count: data.summary.low_count, color: 'var(--success)', bg: 'rgba(0,200,150,0.08)', border: 'rgba(0,200,150,0.25)' },
          ] as any[]).map(({ label, count, color, bg, border }) => (
            <div
              key={label}
              className="p-4 rounded-xl flex items-center justify-between"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span className="text-3xl font-display" style={{ fontFamily: 'var(--font-display)', color }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Product Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} height={180} />)}
        </div>
      ) : cardProducts.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardProducts.map((p, i) => (
            <motion.div
              key={p.product_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-5 cursor-pointer transition-all"
              style={{
                borderColor: p.risk_label === 'HIGH'
                  ? 'rgba(239,68,68,0.3)'
                  : p.risk_label === 'LOW'
                  ? 'rgba(0,200,150,0.2)'
                  : 'var(--border-subtle)',
                boxShadow: p.risk_label === 'HIGH'
                  ? '0 0 16px rgba(239,68,68,0.1)'
                  : p.risk_label === 'LOW'
                  ? '0 0 16px rgba(0,200,150,0.08)'
                  : 'none',
              }}
              onClick={() => navigate(`/explainer?product=${p.product_id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.product_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {(data?.products.find(x => x.product_id === p.product_id) as any)?.category ?? ''}
                  </p>
                </div>
                <RiskBadge label={p.risk_label} size="sm" />
              </div>

              {/* Probability bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>Risk probability</span>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {formatPctNoSign(p.risk_probability * 100)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${p.risk_probability * 100}%`,
                      background: p.risk_label === 'HIGH' ? 'var(--danger)' : p.risk_label === 'MEDIUM' ? 'var(--warning)' : 'var(--success)',
                    }}
                  />
                </div>
              </div>

              {/* Risk factors */}
              <div className="space-y-1">
                <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>Risk factors:</p>
                {p.risk_factors.slice(0, 2).map((f, fi) => (
                  <p key={fi} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    · {f}
                  </p>
                ))}
              </div>

              <button
                className="mt-3 text-xs transition-colors"
                style={{ color: 'var(--brand-primary)' }}
              >
                View details →
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState title="No risk data" description="Risk matrix not available." />
      )}

      {/* Risk Detail Table */}
      {sorted.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Risk Detail Table
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                  {[
                    { col: 'product_name', label: 'Product' },
                    { col: 'risk_label', label: 'Risk' },
                    { col: 'risk_probability', label: 'Probability' },
                    { col: 'recommendation', label: 'Recommendation' },
                  ].map(({ col, label }) => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="px-4 py-3 text-left cursor-pointer text-xs font-semibold uppercase tracking-wide"
                      style={{ color: sortCol === col ? 'var(--brand-primary)' : 'var(--text-muted)', letterSpacing: '0.06em' }}
                    >
                      {label}{sortCol === col && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, idx) => (
                  <tr
                    key={p.product_id}
                    className="transition-colors"
                    style={{
                      background: idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{p.product_name}</td>
                    <td className="px-4 py-3"><RiskBadge label={p.risk_label} /></td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {formatPctNoSign(p.risk_probability * 100)}
                    </td>
                    <td className="px-4 py-3 text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                      {p.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
