import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  /** Small uppercase label above the title (breadcrumb-ish context). */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Primary actions rendered on the trailing side (right on desktop). */
  actions?: ReactNode;
  className?: string;
}

/** Consistent page heading block used by all authenticated and public pages. */
export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
        )}
        <h1 className="h-display break-words">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
}
