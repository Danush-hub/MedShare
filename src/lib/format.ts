/**
 * Presentation helpers for dates, numbers and readable identifiers.
 * Kept dependency-free and pure so they are trivial to unit-reason about.
 */

/** Format an ISO date/datetime as a compact, locale-aware date. */
export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format an ISO datetime including a short time component. */
export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Relative "time ago" label for activity feeds. */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const abs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (abs < hour) return rtf.format(-Math.round(diffMs / minute), 'minute');
  if (abs < day) return rtf.format(-Math.round(diffMs / hour), 'hour');
  if (abs < 30 * day) return rtf.format(-Math.round(diffMs / day), 'day');
  return formatDate(iso);
}

/** Build a zero-padded, human-readable id such as `EQ-2026-007`. */
export function makeReadableId(prefix: string, year: number, sequence: number): string {
  return `${prefix}-${year}-${String(sequence).padStart(3, '0')}`;
}

/** Next sequence number given existing ids matching a prefix pattern. */
export function nextSequence(ids: string[], prefix: string, year: number): number {
  const head = `${prefix}-${year}-`;
  const max = ids
    .filter((id) => id.startsWith(head))
    .reduce((acc, id) => Math.max(acc, Number.parseInt(id.slice(head.length), 10) || 0), 0);
  return max + 1;
}

/** Today's ISO date (yyyy-mm-dd) for date inputs. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Two-letter initials from a display name, for avatar fallbacks. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '•';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
