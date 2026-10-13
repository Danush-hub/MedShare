import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Overlay';
import { Button } from './Button';
import { Label } from './Label';
import { Textarea } from './Textarea';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  /** When set, a required free-text reason is collected before confirming. */
  requireReason?: boolean;
  reasonLabel?: string;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

/**
 * Reusable confirmation dialog. Optionally requires a reason (e.g. rejecting a
 * request). Prevents confirming until required input is supplied.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  requireReason,
  reasonLabel = 'Reason',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  // Reset the collected reason whenever the dialog is (re)opened.
  useEffect(() => {
    if (open) {
      setReason('');
      setTouched(false);
    }
  }, [open]);

  const invalidReason = Boolean(requireReason) && reason.trim().length === 0;

  const handleConfirm = () => {
    if (requireReason && reason.trim().length === 0) {
      setTouched(true);
      return;
    }
    onConfirm(requireReason ? reason.trim() : undefined);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      ariaLabel={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        {tone === 'danger' && (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-error-soft text-error">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="space-y-4 text-sm text-ink-muted">
          <div className={tone === 'danger' ? '' : 'w-full'}>{message}</div>
          {requireReason && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm-reason" required>
                {reasonLabel}
              </Label>
              <Textarea
                id="confirm-reason"
                value={reason}
                rows={3}
                invalid={touched && invalidReason}
                onChange={(event) => setReason(event.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Provide a short explanation…"
              />
              {touched && invalidReason && (
                <p className="text-xs text-error">{reasonLabel} is required.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
