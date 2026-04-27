import { BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No data available',
  description = 'There is no data to display for the selected filters.',
  action,
  icon,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="mb-4 p-4 rounded-full" style={{ background: 'var(--brand-dim)' }}>
        {icon ?? <BarChart2 size={32} style={{ color: 'var(--brand-primary)' }} />}
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: 'var(--brand-primary)',
            color: '#000',
          }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
