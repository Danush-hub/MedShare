import { Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

interface LoadingStateProps {
  /** Accessible label / visible caption describing what is loading. */
  label?: string;
  className?: string;
}

/** Consistent centered spinner for data-driven regions that are still loading. */
export function LoadingState({ label = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-line bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  /** User-safe message, typically from a `ServiceError`. */
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/** Consistent failure panel for data-driven regions whose service call failed. */
export function ErrorState({
  title = 'Unable to load data',
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-card border border-error/20 bg-error-soft px-6 py-14 text-center',
        className,
      )}
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-error">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="max-w-sm text-sm text-ink-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
