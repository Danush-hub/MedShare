import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-field transition ' +
  'focus-visible:outline-none focus-visible:shadow-focus ' +
  'disabled:opacity-60 disabled:cursor-not-allowed select-none';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-navy',
  secondary: 'bg-primary-light text-primary hover:bg-primary-100',
  outline: 'border border-line bg-surface text-ink hover:bg-surface-muted hover:border-line-strong',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  danger: 'bg-error text-white hover:bg-error-foreground',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Single source of truth for button styling.
 * `Button` uses it, and anchor-based calls to action (in-page scrolling, router
 * links) can borrow the exact same visual language without duplicating tokens.
 */
export function buttonVariants({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(base, variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', className);
}
