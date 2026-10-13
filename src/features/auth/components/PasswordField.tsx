import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

/**
 * Password input with an accessible show/hide toggle.
 * Defaults to masked (never plain text) and reuses the shared <Input> so the
 * field styling, focus ring and error state stay consistent with the rest.
 */
export const PasswordField = forwardRef<HTMLInputElement, InputProps>(function PasswordField(
  { className, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={cn('pr-11', className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-subtle transition hover:bg-surface-muted hover:text-ink"
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
});
