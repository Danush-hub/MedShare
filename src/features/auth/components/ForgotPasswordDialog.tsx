import { useEffect, useRef } from 'react';
import { KeyRound, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Informational dialog for "Forgot password?".
 *
 * The prototype has no recovery channel, so this deliberately explains that
 * rather than faking a reset flow or sending any email.
 */
export function ForgotPasswordDialog({ open, onClose }: ForgotPasswordDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
    >
      <div className="absolute inset-0 bg-primary-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm animate-fade-in rounded-card border border-line bg-surface p-6 shadow-card">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle transition hover:bg-surface-muted hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-primary-light text-primary">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h2 id="forgot-password-title" className="text-base font-semibold text-ink">
              Password recovery
            </h2>
            <p className="text-sm leading-6 text-ink-muted">
              Password recovery is not available in this prototype. Please use the demo administrator
              credentials to continue.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button fullWidth onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
