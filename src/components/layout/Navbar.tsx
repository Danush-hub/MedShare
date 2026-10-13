import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { MedShareLogo } from '@/components/common/MedShareLogo';
import { buttonVariants } from '@/components/ui/button-styles';
import { BRAND, LANDING_SECTIONS, ROUTES } from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MobileMenu, type NavItem } from './MobileMenu';

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', anchor: LANDING_SECTIONS.top },
  { label: 'How It Works', anchor: LANDING_SECTIONS.howItWorks },
  { label: 'Features', anchor: LANDING_SECTIONS.features },
  { label: 'Our Impact', anchor: LANDING_SECTIONS.impact },
  { label: 'About', anchor: LANDING_SECTIONS.about },
];

/**
 * Public site header: brand lockup, in-page section navigation and auth CTAs.
 * Sticky on every breakpoint; collapses into a hamburger panel below `md`.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // The mobile panel must not survive a resize into desktop layout.
  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur shadow-header">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link to={ROUTES.home} aria-label={`${BRAND.name} — back to top`} className="rounded-field">
          <MedShareLogo size={38} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={`#${item.anchor}`}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link to={ROUTES.login} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Log In
          </Link>
          <Link to={ROUTES.signup} className={buttonVariants({ size: 'sm' })}>
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className={buttonVariants({
            variant: 'outline',
            size: 'sm',
            className: 'md:hidden px-2.5',
          })}
        >
          {menuOpen ? (
            <>
              <X className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Close menu</span>
            </>
          ) : (
            <>
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </>
          )}
        </button>
      </Container>

      <MobileMenu open={menuOpen} items={NAV_ITEMS} onNavigate={() => setMenuOpen(false)} />
    </header>
  );
}
