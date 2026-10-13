import { Outlet, Link } from 'react-router-dom';
import { Eye, ClipboardList, Truck } from 'lucide-react';
import { MedShareLogo } from '@/components/common/MedShareLogo';
import { ROUTES } from '@/constants';

const benefits = [
  {
    icon: Eye,
    title: 'Equipment visibility',
    text: 'See what shareable assets partner hospitals have on hand, in real time.',
  },
  {
    icon: ClipboardList,
    title: 'Coordinated requests',
    text: 'Borrow and lend with clear, auditable ownership at every step.',
  },
  {
    icon: Truck,
    title: 'Transfer tracking',
    text: 'Follow every movement from scheduled pickup through safe return.',
  },
];

/**
 * Split-screen shell shared by the login and signup screens.
 *
 * Form content sits on the left (and full-width on mobile), with a calm,
 * blue-toned healthcare panel on the right that reinforces the platform's
 * value. The decorative panel is hidden below the `lg` breakpoint so the form
 * stays immediately accessible without scrolling.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-surface-background">
      {/* Form / content column */}
      <main id="main-content" className="flex w-full flex-col lg:w-1/2">
        <div className="px-6 pt-6">
          <Link
            to={ROUTES.home}
            aria-label="MedShare home"
            className="inline-block w-fit rounded-field"
          >
            <MedShareLogo size={34} />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Decorative brand panel */}
      <aside className="brand-panel relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        {/* Light-blue decorative accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-primary-light/10 blur-3xl"
        />

        <div className="relative space-y-8">
          <div className="space-y-3">
            <p className="eyebrow-label !text-primary-200">MedShare Network</p>
            <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
              Better Connected. Better Prepared.
            </h2>
            <p className="max-w-md text-sm leading-6 text-primary-100">
              Coordinate medical equipment sharing across hospitals and clinics, so critical
              resources reach the patients who need them — faster.
            </p>
          </div>

          <ul className="max-w-md space-y-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-white/10 text-primary-200">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-sm leading-5 text-primary-100">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-200">
          Prototype interface — not a live clinical service.
        </p>
      </aside>
    </div>
  );
}
