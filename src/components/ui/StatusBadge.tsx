import { Badge, type BadgeTone } from './Badge';

/**
 * Maps a human-readable domain status/condition label to a semantic badge tone.
 * Keeping the mapping here guarantees consistent color language for every
 * status pill across equipment, requests, transfers and institutions.
 */
const STATUS_TONES: Record<string, BadgeTone> = {
  // Equipment availability
  Available: 'success',
  'Partially Available': 'warning',
  Reserved: 'info',
  Unavailable: 'neutral',
  'Under Maintenance': 'warning',
  Retired: 'neutral',
  // Equipment condition
  Excellent: 'success',
  Good: 'info',
  'Maintenance Required': 'warning',
  // Request lifecycle
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
  Cancelled: 'neutral',
  Dispatched: 'info',
  Received: 'success',
  Returned: 'info',
  Completed: 'success',
  // Transfer lifecycle
  'Awaiting Dispatch': 'warning',
  'In Transit': 'info',
  'Return Scheduled': 'info',
  // Institution lifecycle
  Active: 'success',
  'Pending Verification': 'warning',
  Suspended: 'error',
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function statusTone(status: string): BadgeTone {
  return STATUS_TONES[status] ?? 'neutral';
}

/** Consistent status pill for any known domain label. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge tone={statusTone(status)} className={className}>
      {status}
    </Badge>
  );
}
