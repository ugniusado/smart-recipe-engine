const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return currencyFmt.format(value);
}

/** Compact version for KPI cards — abbreviates large values */
export function formatCurrencyCompact(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '$0.00';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000)     return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000)        return `$${(value / 1_000).toFixed(1)}K`;
  return currencyFmt.format(value);
}

export function formatPct(value: number): string {
  return `${value.toFixed(0)}%`;
}

/** Maps urgency level to display color classes */
export const URGENCY_COLOR: Record<string, string> = {
  expired: 'urg-expired',
  urgent:  'urg-urgent',
  soon:    'urg-soon',
  safe:    'urg-safe',
};

export const URGENCY_LABEL: Record<string, string> = {
  expired: 'Expired',
  urgent:  '0-2d',
  soon:    '3-7d',
  safe:    '8d+',
};
