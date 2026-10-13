import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button-styles';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/cn';

/** A header entry: either an in-page landing anchor or a router route. */
export interface NavItem {
  label: string;
  /** Landing section id — rendered as a same-page anchor link. */
  anchor?: string;
  /** Route path — rendered with React Router navigation. */
  to?: string;
}

interface MobileMenuProps {
  id?: string;
  open: boolean;
  items: NavItem[];
  className?: string;
  /** Called after any link activation so the panel can close itself. */
  onNavigate: () => void;
}

/**
 * Collapsible mobile navigation panel.
 * Only mounted while open, so hidden links never receive keyboard focus.
 */
export function MobileMenu({
  id = 'mobile-menu',
  open,
  items,
  className,
  onNavigate,
}: MobileMenuProps) {
  if (!open) return null;

  return (
    <div
      id={id}
      role="region"
      aria-label="Mobile navigation"
      className={cn('animate-fade-in border-t border-line bg-surface', className)}
    >
      <nav aria-label="Mobile primary" className="flex flex-col px-layout py-3">
        {items.map((item) =>
          item.to ? (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              className="rounded-field px-3 py-3 text-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              {item.label}
            </Link>
          ) : (
            <a
              key={item.label}
              href={`#${item.anchor}`}
              onClick={onNavigate}
              className="rounded-field px-3 py-3 text-sm font-medium text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            >
              {item.label}
            </a>
          ),
        )}
      </nav>

      <div className="flex flex-col gap-2 border-t border-line px-layout py-4">
        <Link
          to={ROUTES.login}
          onClick={onNavigate}
          className={buttonVariants({ variant: 'outline', fullWidth: true })}
        >
          Log In
        </Link>
        <Link
          to={ROUTES.signup}
          onClick={onNavigate}
          className={buttonVariants({ fullWidth: true })}
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
