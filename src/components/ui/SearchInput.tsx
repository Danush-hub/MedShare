import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Value-driven clear button. Provide an onChange that resets the value. */
  onClear?: () => void;
}

const fieldBase =
  'w-full rounded-field border bg-surface py-2.5 pl-10 pr-9 text-sm text-ink ' +
  'placeholder:text-ink-subtle transition focus:outline-none focus-visible:shadow-focus';

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, value, onClear, ...rest },
  ref,
) {
  const hasValue = typeof value === 'string' && value.length > 0;
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
        aria-hidden="true"
      />
      <input
        ref={ref}
        type="search"
        value={value}
        className={cn(fieldBase, 'border-line', className)}
        {...rest}
      />
      {onClear && hasValue && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-subtle hover:bg-surface-muted hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
});
