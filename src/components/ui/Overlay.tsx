import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface OverlayBaseProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Accessible label used when no visible title is provided. */
  ariaLabel?: string;
  className?: string;
  /** Controls the max width of the panel. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes: Record<NonNullable<OverlayBaseProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

/** Locks body scroll and wires Escape-to-close while `open` is true. */
function useOverlayBehavior(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);
}

function OverlayHeader({
  title,
  description,
  onClose,
}: Pick<OverlayBaseProps, 'title' | 'description' | 'onClose'>) {
  if (!title && !description) return null;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="min-w-0 space-y-0.5">
        {title && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
        {description && <p className="text-sm text-ink-muted">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-field text-ink-muted hover:bg-surface-muted hover:text-ink"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Centered modal dialog rendered in a portal. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  ariaLabel,
  size = 'md',
  className,
}: OverlayBaseProps) {
  useOverlayBehavior(open, onClose);
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-card bg-surface shadow-card animate-fade-in sm:rounded-card',
          sizes[size],
          className,
        )}
      >
        <OverlayHeader title={title} description={description} onClose={onClose} />
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Right-hand side drawer, sharing the modal accessibility behavior. */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  ariaLabel,
  size = 'lg',
  className,
}: OverlayBaseProps) {
  useOverlayBehavior(open, onClose);
  if (!open) return null;

  const widthBySize = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-xl',
    xl: 'sm:max-w-3xl',
  } as const;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          'absolute right-0 top-0 flex h-full w-full flex-col bg-surface shadow-card animate-fade-in',
          widthBySize[size],
          className,
        )}
      >
        <OverlayHeader title={title} description={description} onClose={onClose} />
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
