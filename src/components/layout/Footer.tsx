import { Link } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { MedShareLogo } from '@/components/common/MedShareLogo';
import { BRAND, LANDING_SECTIONS, ROUTES } from '@/constants';

const PRODUCT_LINKS = [
  { label: 'How It Works', anchor: LANDING_SECTIONS.howItWorks },
  { label: 'Features', anchor: LANDING_SECTIONS.features },
  { label: 'Safety and Trust', anchor: LANDING_SECTIONS.safety },
];

const PLATFORM_LINKS = [
  { label: 'Log In', to: ROUTES.login },
  { label: 'Get Started', to: ROUTES.signup },
];

const DISCOVER_LINKS = [
  { label: 'Overview', anchor: LANDING_SECTIONS.top },
  { label: 'Use Cases', anchor: LANDING_SECTIONS.useCases },
  { label: 'Our Impact', anchor: LANDING_SECTIONS.impact },
];

const linkClass =
  'text-sm text-white/70 transition-colors hover:text-white focus-visible:text-white';

/** Comprehensive public footer: brand, navigation, contact placeholder, disclaimer. */
export function Footer() {
  return (
    <footer className="bg-primary-navy text-white">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <MedShareLogo size={36} variant="onBrand" />
            <p className="max-w-xs text-sm leading-relaxed text-white/70">{BRAND.description}</p>
          </div>

          <nav aria-label="Product">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Product</h2>
            <ul className="mt-4 space-y-3">
              {PRODUCT_LINKS.map((item) => (
                <li key={item.label}>
                  <a href={`#${item.anchor}`} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Platform">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Platform</h2>
            <ul className="mt-4 space-y-3">
              {PLATFORM_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Explore">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Discover</h2>
            <ul className="mt-4 space-y-3">
              {DISCOVER_LINKS.map((item) => (
                <li key={item.label}>
                  <a href={`#${item.anchor}`} className={linkClass}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 grid gap-6 border-t border-white/20 pt-8 sm:grid-cols-2">
          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="text-sm font-semibold text-white">
              Contact
            </h2>
            <p className="mt-3 text-sm text-white/70">
              Contact details will be available as the project develops.
            </p>
          </section>
          <section aria-labelledby="footer-concept" className="sm:text-right">
            <h2 id="footer-concept" className="text-sm font-semibold text-white">
              About this prototype
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/70 sm:ml-auto">
              MedShare is a concept prototype for equipment-sharing coordination and is not a
              substitute for institutional medical-equipment safety procedures.
            </p>
          </section>
        </div>

        <p className="mt-8 text-xs text-white/60">© 2026 MedShare — Prototype Concept</p>
      </Container>
    </footer>
  );
}
