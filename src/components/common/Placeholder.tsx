import type { LucideIcon } from 'lucide-react';
import { Hammer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface PlaceholderProps {
  icon?: LucideIcon;
  title: string;
  description: string;
}

/**
 * Small, reusable "coming soon" block used by placeholder route pages so the
 * information architecture is navigable before features are built.
 */
export function Placeholder({ icon: Icon = Hammer, title, description }: PlaceholderProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="max-w-md text-sm text-ink-muted">{description}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
          Coming soon
        </p>
      </CardContent>
    </Card>
  );
}
