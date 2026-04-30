export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `£${(value / 1_000).toFixed(0)}K`;
    return `£${value.toFixed(0)}`;
  }
  return `£${value.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPct(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatPctNoSign(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatPeriod(period: string): string {
  if (period.includes('-Q')) {
    const [year, q] = period.split('-');
    return `${q} ${year}`;
  }
  const [year, month] = period.split('-');
  if (!month) return year;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
