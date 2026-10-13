/** Brand + application metadata reused across shells and marketing surfaces. */
export const BRAND = {
  name: 'MedShare',
  tagline: 'Shared care, across hospitals.',
  description:
    'A professional platform for hospitals and clinics to discover, request, approve and track shared medical equipment.',
} as const;

/** In-page anchor ids of the public landing sections (shared by nav + footer). */
export const LANDING_SECTIONS = {
  top: 'top',
  about: 'about',
  howItWorks: 'how-it-works',
  features: 'features',
  useCases: 'use-cases',
  impact: 'impact',
  safety: 'safety',
} as const;

export { ROUTES } from './routes';
export { APP_NAV, resolveNavItem } from './navigation';
export type { NavItem } from './navigation';
