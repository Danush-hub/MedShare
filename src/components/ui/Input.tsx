import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Renders the error border/message hook for future form integration. */
  invalid?: boolean;
}

const fieldBase =
  'w-full rounded-field border bg-surface px-3.5 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-subtle transition focus:outline-none focus-visible:shadow-focus ' +
  'disabled:cursor-not-allowed disabled:bg-surface-muted';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(fieldBase, invalid ? 'border-error' : 'border-line', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});
