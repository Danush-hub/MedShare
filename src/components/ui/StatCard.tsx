import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card } from './Card';

export type StatTone = 'primary' | 'success' | 'warning' | 'info' | 'navy';

const toneClasses: Record<StatTone, string> = {
  primary: 'bg-primary-light text-primary',
  success: 'bg-success-soft text-success-foreground',
  warning: 'bg-warning-soft text-warning-foreground',
  info: 'bg-info-soft text-info-foreground',
  navy: 'bg-primary-50 text-primary-navy',
};

export interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  hint?: string;
  tone?: StatTone;
  className?: string;
}

/** Compact metric tile used across the dashboard and module summary rows. */
export function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  tone = 'primary',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-3xl font-bold tracking-tight text-ink">{value}</p>
          <p className="mt-1 text-sm font-medium text-ink">{label}</p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        <span
          className={cn(
            'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-field',
            toneClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}
