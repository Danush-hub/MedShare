import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-muted border-line',
  info: 'bg-info-soft text-info-foreground border-primary-100',
  success: 'bg-success-soft text-success-foreground border-success/20',
  warning: 'bg-warning-soft text-warning-foreground border-warning/20',
  error: 'bg-error-soft text-error-foreground border-error/20',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

/** Compact status pill. Semantic tone maps to domain status labels. */
export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
