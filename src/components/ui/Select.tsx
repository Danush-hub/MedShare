import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  /** Convenience options list; alternatively pass <option> children. */
  options?: SelectOption[];
  /** Placeholder (disabled, empty-value) option. */
  placeholder?: string;
}

const fieldBase =
  'w-full appearance-none rounded-field border bg-surface px-3.5 py-2.5 pr-10 text-sm text-ink ' +
  'transition focus:outline-none focus-visible:shadow-focus ' +
  'disabled:cursor-not-allowed disabled:bg-surface-muted';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, options, placeholder, children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(fieldBase, invalid ? 'border-error' : 'border-line', className)}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
        aria-hidden="true"
      />
    </div>
  );
});
