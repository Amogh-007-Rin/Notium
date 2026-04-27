interface Props {
  rows?: number;
  height?: number;
}

export function SkeletonCard({ rows = 3, height = 100 }: Props) {
  return (
    <div className="card p-5 space-y-3" style={{ height }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: i === 0 ? 12 : 20,
            width: i === 0 ? '40%' : i === rows - 1 ? '60%' : '80%',
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex gap-3 p-3 items-center" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      {[40, 80, 60, 50, 50, 40, 40, 60].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: 14, width: `${w}px`, flexShrink: 0 }} />
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 300 }: { height?: number }) {
  return (
    <div className="card p-5">
      <div className="skeleton mb-3" style={{ height: 14, width: '30%' }} />
      <div className="skeleton" style={{ height }} />
    </div>
  );
}
