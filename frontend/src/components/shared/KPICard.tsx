import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/format';

interface Props {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  sparklineData?: number[];
  delay?: number;
}

function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const animFrame = useRef<number>();

  useEffect(() => {
    startTime.current = null;
    const animate = (time: number) => {
      if (!startTime.current) startTime.current = time;
      const elapsed = time - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * ease);
      if (progress < 1) animFrame.current = requestAnimationFrame(animate);
    };
    animFrame.current = requestAnimationFrame(animate);
    return () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); };
  }, [target, duration]);

  return current;
}

export function KPICard({ label, value, change, changeLabel, sparklineData, delay = 0 }: Props) {
  const isPositive = change !== undefined ? change >= 0 : true;
  const sparkData = (sparklineData ?? []).map((v, i) => ({ v, i }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="card p-5 relative overflow-hidden cursor-default group"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      {/* Hover accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: 'var(--brand-primary)' }}
      />

      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        {label}
      </p>

      <p
        className="text-4xl mb-3"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1 }}
      >
        {value}
      </p>

      <div className="flex items-end justify-between">
        {change !== undefined && (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp size={14} style={{ color: 'var(--success)' }} />
            ) : (
              <TrendingDown size={14} style={{ color: 'var(--danger)' }} />
            )}
            <span
              className="text-xs font-mono"
              style={{ color: isPositive ? 'var(--success)' : 'var(--danger)' }}
            >
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                {changeLabel}
              </span>
            )}
          </div>
        )}

        {sparkData.length > 0 && (
          <div style={{ width: 60, height: 32 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--brand-primary)"
                  fill="rgba(0,200,150,0.15)"
                  strokeWidth={1.5}
                  dot={false}
                  animationBegin={0}
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
