import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Play, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useRunSimulation, useRunSensitivity } from '@/api/simulator';
import type { SimulatorAdjustments, SimulatorResponse } from '@/types';
import { formatCurrency, formatPct, formatPctNoSign } from '@/utils/format';
import toast from 'react-hot-toast';

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

const DEFAULT_ADJ: SimulatorAdjustments = {
  cost_change_pct: 0,
  discount_rate_change: 0,
  volume_change_pct: 0,
  price_change_pct: 0,
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function SliderInput({ label, value, min, max, step, unit, onChange }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>
        <span
          className="text-sm font-mono px-2 py-0.5 rounded"
          style={{
            background: value !== 0 ? 'var(--brand-dim)' : 'var(--bg-elevated)',
            color: value > 0 ? 'var(--success)' : value < 0 ? 'var(--danger)' : 'var(--text-muted)',
          }}
        >
          {value > 0 ? '+' : ''}{value}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${((value - min) / (max - min)) * 100}%, var(--bg-subtle) ${((value - min) / (max - min)) * 100}%, var(--bg-subtle) 100%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>{min}{unit}</span>
        <span>0</span>
        <span>+{max}{unit}</span>
      </div>
    </div>
  );
}

function MetricDelta({ label, baseline, scenario, unit = 'currency' }: { label: string; baseline: number; scenario: number; unit?: string }) {
  const delta = scenario - baseline;
  const pct = (delta / (Math.abs(baseline) + 1e-9)) * 100;
  const isPositive = delta >= 0;
  const format = unit === 'currency' ? formatCurrency : formatPctNoSign;
  const bVal = unit === 'currency' ? formatCurrency(baseline, true) : formatPctNoSign(baseline);
  const sVal = unit === 'currency' ? formatCurrency(scenario, true) : formatPctNoSign(scenario);

  return (
    <div className="card p-4">
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Baseline</div>
          <div className="font-mono text-base" style={{ color: 'var(--text-secondary)' }}>{bVal}</div>
        </div>
        <div className="text-center px-2">
          <div
            className="text-sm font-mono px-2 py-0.5 rounded"
            style={{
              color: isPositive ? 'var(--success)' : 'var(--danger)',
              background: isPositive ? 'rgba(0,200,150,0.1)' : 'rgba(239,68,68,0.1)',
            }}
          >
            {isPositive ? '+' : ''}{pct.toFixed(1)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Scenario</div>
          <div className="font-mono text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{sVal}</div>
        </div>
      </div>
    </div>
  );
}

export function SimulatorPage() {
  const [product, setProduct] = useState('P001');
  const [adj, setAdj] = useState<SimulatorAdjustments>(DEFAULT_ADJ);
  const [result, setResult] = useState<SimulatorResponse | null>(null);
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [sensParam, setSensParam] = useState('cost_change_pct');
  const [sensData, setSensData] = useState<Array<{ parameter_value: number; projected_profit: number }>>([]);

  const { mutate: runSim, isPending: simRunning } = useRunSimulation();
  const { mutate: runSens, isPending: sensRunning } = useRunSensitivity();

  const handleRun = () => {
    runSim(
      { product_id: product, adjustments: adj },
      {
        onSuccess: (data) => setResult(data),
        onError: () => toast.error('Simulation failed. Try again.'),
      }
    );
  };

  const handleSensitivity = () => {
    runSens(
      { product_id: product, parameter: sensParam, base_adjustments: adj },
      {
        onSuccess: (data) => setSensData(data.points),
        onError: () => toast.error('Sensitivity analysis failed.'),
      }
    );
  };

  const reset = () => {
    setAdj(DEFAULT_ADJ);
    setResult(null);
    setSensData([]);
  };

  return (
    <div className="space-y-6">
      {/* Product selector */}
      <div className="flex items-center gap-3">
        <select
          value={product}
          onChange={(e) => { setProduct(e.target.value); setResult(null); }}
          className="px-4 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        >
          {PRODUCTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Sliders */}
        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Adjust Parameters
          </h2>

          <SliderInput
            label="Cost Change"
            value={adj.cost_change_pct}
            min={-30} max={30} step={0.5} unit="%"
            onChange={(v) => setAdj({ ...adj, cost_change_pct: v })}
          />
          <SliderInput
            label="Discount Rate Change"
            value={adj.discount_rate_change}
            min={-5} max={5} step={0.1} unit=" pp"
            onChange={(v) => setAdj({ ...adj, discount_rate_change: v })}
          />
          <SliderInput
            label="Volume Change"
            value={adj.volume_change_pct}
            min={-30} max={30} step={1} unit="%"
            onChange={(v) => setAdj({ ...adj, volume_change_pct: v })}
          />
          <SliderInput
            label="Price Change"
            value={adj.price_change_pct}
            min={-20} max={20} step={0.5} unit="%"
            onChange={(v) => setAdj({ ...adj, price_change_pct: v })}
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleRun}
              disabled={simRunning}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all glow-brand"
              style={{ background: 'var(--brand-primary)', color: '#000', opacity: simRunning ? 0.7 : 1 }}
            >
              {simRunning ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={16} />
              )}
              {simRunning ? 'Running...' : 'Run Simulation'}
            </button>
            <button
              onClick={reset}
              className="p-3 rounded-lg transition-colors"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-default)' }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              {/* Profit delta hero */}
              <div className="card p-6 text-center">
                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Projected Profit Impact</p>
                <p
                  className="text-5xl mb-2"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: result.delta.profit_change >= 0 ? 'var(--success)' : 'var(--danger)',
                  }}
                >
                  {result.delta.profit_change >= 0 ? '+' : ''}{formatCurrency(result.delta.profit_change, true)}
                </p>
                <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {result.delta.profit_change >= 0 ? '+' : ''}{result.delta.profit_change_pct.toFixed(1)}% change in profit
                </p>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                <MetricDelta label="Revenue" baseline={result.baseline.revenue} scenario={result.scenario.revenue} />
                <MetricDelta label="Cost" baseline={result.baseline.cost} scenario={result.scenario.cost} />
                <MetricDelta label="Profit" baseline={result.baseline.profit} scenario={result.scenario.profit} />
                <MetricDelta label="Margin %" baseline={result.baseline.margin_pct} scenario={result.scenario.margin_pct} unit="pct" />
              </div>

              {/* Narrative */}
              <div
                className="p-4 rounded-xl text-sm"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', lineHeight: 1.7 }}
              >
                {result.narrative}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card flex items-center justify-center"
              style={{ minHeight: 320 }}
            >
              <div className="text-center p-8">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--brand-dim)' }}>
                  <Play size={20} style={{ color: 'var(--brand-primary)' }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Adjust sliders and run simulation
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Results will appear here
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sensitivity Analysis */}
      {result && (
        <div className="card overflow-hidden">
          <button
            onClick={() => setShowSensitivity(!showSensitivity)}
            className="w-full flex items-center justify-between p-5 transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            <h2 className="text-lg font-semibold">Sensitivity Analysis</h2>
            {showSensitivity ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <AnimatePresence>
            {showSensitivity && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-5 pt-0 space-y-4">
                  <div className="flex items-center gap-3">
                    <select
                      value={sensParam}
                      onChange={(e) => setSensParam(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      <option value="cost_change_pct">Cost Change %</option>
                      <option value="discount_rate_change">Discount Rate Change</option>
                      <option value="volume_change_pct">Volume Change %</option>
                      <option value="price_change_pct">Price Change %</option>
                    </select>
                    <button
                      onClick={handleSensitivity}
                      disabled={sensRunning}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                      style={{ background: 'var(--brand-secondary)', color: '#fff', opacity: sensRunning ? 0.7 : 1 }}
                    >
                      {sensRunning ? 'Analysing...' : 'Analyse'}
                    </button>
                  </div>

                  {sensData.length > 0 && (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={sensData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                        <XAxis dataKey="parameter_value" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v, true)} />
                        <Tooltip
                          content={({ active, payload, label }) =>
                            active && payload?.[0] ? (
                              <div className="glass rounded-lg p-2 text-xs">
                                <div style={{ color: 'var(--text-muted)' }}>Value: {label}</div>
                                <div style={{ color: 'var(--brand-primary)' }}>
                                  Profit: {formatCurrency(payload[0].value as number, true)}
                                </div>
                              </div>
                            ) : null
                          }
                        />
                        <ReferenceLine x={adj[sensParam as keyof SimulatorAdjustments]} stroke="var(--brand-primary)" strokeDasharray="4 2" label={{ value: 'Current', fill: 'var(--brand-primary)', fontSize: 11 }} />
                        <Line type="monotone" dataKey="projected_profit" stroke="var(--brand-secondary)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
