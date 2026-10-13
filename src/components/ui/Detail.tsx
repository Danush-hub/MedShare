import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface DetailFieldProps {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Label/value pair used to compose read-only detail views in drawers. */
export function DetailField({ label, children, className }: DetailFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-subtle">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

/** Two-column definition list wrapper for detail panels. */
export function DetailList({
  children,
  className,
  columns = 2,
}: {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2;
}) {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-4',
        columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
    >
      {children}
    </dl>
  );
}
