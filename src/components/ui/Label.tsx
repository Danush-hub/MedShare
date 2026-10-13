import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Shows a required asterisk hint. */
  required?: boolean;
}

export function Label({ className, required, children, ...rest }: LabelProps) {
  return (
    <label className={cn('block text-sm font-medium text-ink', className)} {...rest}>
      {children}
      {required && (
        <span className="ml-0.5 text-error" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
