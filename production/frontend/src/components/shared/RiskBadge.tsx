import type { RiskLabel } from '@/types';
import { cn } from '@/utils/format';

interface Props {
  label: RiskLabel;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<RiskLabel, { bg: string; text: string; border: string }> = {
  HIGH: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', border: '#EF4444' },
  MEDIUM: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', border: '#F59E0B' },
  LOW: { bg: 'rgba(0,200,150,0.15)', text: '#00C896', border: '#00C896' },
};

export function RiskBadge({ label, size = 'sm' }: Props) {
  const c = config[label];
  const padding = size === 'lg' ? '6px 14px' : size === 'md' ? '4px 10px' : '2px 8px';
  const fontSize = size === 'lg' ? '14px' : size === 'md' ? '12px' : '11px';

  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        borderLeft: `3px solid ${c.border}`,
        padding,
        fontSize,
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        borderRadius: '4px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
