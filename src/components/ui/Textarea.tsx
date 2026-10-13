import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Renders the error border hook for form integration. */
  invalid?: boolean;
}

const fieldBase =
  'w-full rounded-field border bg-surface px-3.5 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-subtle transition focus:outline-none focus-visible:shadow-focus ' +
  'disabled:cursor-not-allowed disabled:bg-surface-muted';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 3, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(fieldBase, 'resize-y', invalid ? 'border-error' : 'border-line', className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});
