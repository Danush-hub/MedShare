import { cn } from '@/lib/cn';

export interface TabItem {
  value: string;
  label: string;
  badge?: number | string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

/** Accessible segmented tab bar used for request/incoming views and settings. */
export function Tabs({ items, value, onChange, className, ariaLabel = 'Tabs' }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex flex-wrap gap-1 border-b border-line', className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              '-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-ink-muted hover:border-line-strong hover:text-ink',
            )}
          >
            {item.label}
            {item.badge !== undefined && (
              <span
                className={cn(
                  'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold',
                  active ? 'bg-primary-light text-primary' : 'bg-surface-muted text-ink-muted',
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
