/** Shared formatting helpers used by the finance report pages. */

export function etb(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return 'ETB 0.00';
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return value < 0 ? `(${formatted})` : formatted;
}

export function num(value: number | null | undefined, digits = 2): string {
  if (value == null || isNaN(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function numShort(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '0';
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return num(value, 0);
}

export function fmtDate(epoch: number | null | undefined): string {
  if (epoch == null) return '—';
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function fmtDateTime(epoch: number | null | undefined): string {
  if (epoch == null) return '—';
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** label for an account-type code (1..5) */
export function accountTypeLabel(code: number | null | undefined): string {
  switch (code) {
    case 1: return 'Asset';
    case 2: return 'Liability';
    case 3: return 'Equity';
    case 4: return 'Revenue';
    case 5: return 'Expense';
    default: return '—';
  }
}

// ─── Reporting period presets ─────────────────────────────────────────────────

export interface PeriodWindow {
  from: number | null;
  to: number | null;
}

export interface PeriodPreset {
  id: string;
  label: string;
}

export const PERIOD_PRESETS: PeriodPreset[] = [
  { id: 'all', label: 'All time' },
  { id: 'today', label: 'Today' },
  { id: 'month', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'year', label: 'This year' },
];

export function periodWindow(id: string): PeriodWindow {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const endOfDay = (d: Date) => startOfDay(d) + 24 * 60 * 60 * 1000 - 1;

  switch (id) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), to: endOfDay(now) };
    case 'lastMonth':
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(),
        to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    case '90d':
      return { from: startOfDay(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)), to: endOfDay(now) };
    case 'year':
      return { from: new Date(now.getFullYear(), 0, 1).getTime(), to: endOfDay(now) };
    default:
      return { from: null, to: null };
  }
}

export function periodLabel(id: string): string {
  return PERIOD_PRESETS.find((p) => p.id === id)?.label ?? 'All time';
}

export function windowLabel(from: number | null | undefined, to: number | null | undefined): string {
  if (from == null && to == null) return 'All time';
  if (from != null && to != null) return `${fmtDate(from)} – ${fmtDate(to)}`;
  if (from != null) return `From ${fmtDate(from)}`;
  return `Up to ${fmtDate(to)}`;
}