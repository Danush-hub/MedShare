import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';

export interface TimelineItem {
  status: string;
  at: string;
  note?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

/** Vertical status-change timeline for request and transfer detail views. */
export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn('relative space-y-5 border-l border-line pl-5', className)}>
      {items.map((item, index) => (
        <li key={`${item.status}-${item.at}-${index}`} className="relative">
          <span
            className={cn(
              'absolute -left-[1.55rem] top-1 h-3 w-3 rounded-full border-2 border-surface',
              index === items.length - 1 ? 'bg-primary' : 'bg-line-strong',
            )}
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-ink">{item.status}</p>
          <p className="text-xs text-ink-subtle">{formatDateTime(item.at)}</p>
          {item.note && <p className="mt-0.5 text-sm text-ink-muted">{item.note}</p>}
        </li>
      ))}
    </ol>
  );
}
