import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants, type ButtonSize, type ButtonVariant } from '@/components/ui/button-styles';
import { cn } from '@/lib/cn';

interface CtaBaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Same-page anchor CTA: glides to a landing section without a route change. */
interface AnchorCtaProps extends CtaBaseProps {
  anchor: string;
  to?: never;
}

/** Route CTA: navigates with React Router (no full-page reload). */
interface RouteCtaProps extends CtaBaseProps {
  to: string;
  anchor?: never;
}

export type CtaLinkProps = AnchorCtaProps | RouteCtaProps;

/**
 * Call-to-action that looks exactly like the shared `Button` but renders as a
 * link — either an in-page anchor or a React Router navigation.
 */
export function CtaLink({ children, anchor, to, variant, size, className }: CtaLinkProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={`#${anchor}`} className={classes}>
      {children}
    </a>
  );
}
