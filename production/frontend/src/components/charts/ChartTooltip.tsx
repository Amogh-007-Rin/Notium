import { formatCurrency, formatPctNoSign } from '@/utils/format';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface Props {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export function DarkTooltip({ active, payload, label }: Props) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="glass rounded-lg p-3 shadow-xl"
      style={{ minWidth: 160, fontSize: 13 }}
    >
      <p className="font-mono text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      {payload.map((item) => (
        <div key={item.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
          </div>
          <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
            {item.dataKey.includes('margin') || item.dataKey.includes('pct')
              ? formatPctNoSign(item.value)
              : formatCurrency(item.value, true)}
          </span>
        </div>
      ))}
    </div>
  );
}
