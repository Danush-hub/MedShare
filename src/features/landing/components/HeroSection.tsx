import type { ReactNode } from 'react';
import {
  ArrowRight,
  Boxes,
  ClipboardList,
  Landmark,
  ScanLine,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { LANDING_SECTIONS, ROUTES } from '@/constants';
import { cn } from '@/lib/cn';
import { CtaLink } from './CtaLink';
import { Photo } from './Photo';
import { LANDING_PHOTOS, unsplashPhoto, unsplashSrcSet } from '../media';

const TRUST_POINTS = [
  { icon: Landmark, label: 'Built for healthcare institutions' },
  { icon: ShieldCheck, label: 'Safety-focused workflows' },
  { icon: ScanLine, label: 'Transparent equipment tracking' },
];

interface FloatingCardProps {
  icon: ReactNode;
  title: string;
  rows: ReactNode;
  className?: string;
}

/** Illustrative interface chip floating over the hero photograph. */
function FloatingCard({ icon, title, rows, className }: FloatingCardProps) {
  return (
    <div
      className={cn(
        'w-[15.5rem] rounded-card border border-line bg-white/95 p-3.5 shadow-card-hover backdrop-blur-sm',
        className,
      )}
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        {icon}
        {title}
      </p>
      <div className="mt-2.5 space-y-1.5 text-xs text-ink-muted">{rows}</div>
    </div>
  );
}

const rowClass =
  'flex items-center justify-between gap-3 rounded-field bg-primary-light px-2.5 py-1.5';

/** Above-the-fold introduction: value proposition, CTAs and a conceptual preview. */
export function HeroSection() {
  return (
    <section
      id={LANDING_SECTIONS.top}
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-line bg-surface"
    >
      <div aria-hidden="true" className="brand-glow pointer-events-none absolute inset-0" />
      <Container className="relative grid gap-14 py-14 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <p className="eyebrow-label">Smarter healthcare resource sharing</p>
          <h1 id="hero-heading" className="h-hero mt-4">
            Better Access to <span className="text-primary">Equipment</span>.
            <br className="hidden sm:block" /> Stronger{' '}
            <span className="text-primary">Healthcare</span> for Everyone.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            MedShare connects hospitals and clinics to coordinate medical equipment sharing, helping
            healthcare teams respond to shortages, manage temporary demand, and make better use of
            available resources.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CtaLink to={ROUTES.signup} size="lg">
              Explore MedShare
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </CtaLink>
            <CtaLink anchor={LANDING_SECTIONS.howItWorks} size="lg" variant="outline">
              How It Works
            </CtaLink>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-2.5 text-sm text-ink">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-field bg-primary-light">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </span>
                <span className="font-medium leading-snug">{label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-ink-subtle">
            Design principles for the proposed platform — not certifications or deployment claims.
          </p>
        </div>

        <div className="relative">
          <div className="relative rounded-card border border-line bg-surface p-2.5 shadow-card">
            <Photo
              src={unsplashPhoto(LANDING_PHOTOS.hero.id, 1000, 1200)}
              srcSet={unsplashSrcSet(LANDING_PHOTOS.hero.id, [600, 900, 1200], 1200)}
              sizes="(min-width: 1024px) 44vw, 92vw"
              alt={LANDING_PHOTOS.hero.alt}
              priority
              className="aspect-[5/6] w-full rounded-[12px] sm:aspect-[4/3] lg:aspect-[5/6]"
              imgClassName="object-[50%_35%]"
            />
            <p className="px-1.5 py-2.5 text-[0.7rem] text-ink-subtle">
              Illustrative interface concepts — not live inventory or real transfer data.
            </p>
          </div>

          <FloatingCard
            icon={<Boxes className="h-3.5 w-3.5" aria-hidden="true" />}
            title="Equipment availability"
            rows={
              <>
                <span className={rowClass}>
                  <span>Infusion pumps</span>
                  <span className="font-semibold text-primary">Listing</span>
                </span>
                <span className={rowClass}>
                  <span>Patient monitors</span>
                  <span className="font-semibold text-primary">Listing</span>
                </span>
              </>
            }
            className="absolute -left-4 -top-6 hidden sm:block lg:-left-10"
          />

          <FloatingCard
            icon={<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />}
            title="Request workflow"
            rows={
              <>
                <span className={rowClass}>
                  <span>1. Request</span>
                  <span>Submitted</span>
                </span>
                <span className={rowClass}>
                  <span>2. Review</span>
                  <span>Approved</span>
                </span>
              </>
            }
            className="absolute -right-3 top-1/3 hidden md:block lg:-right-8"
          />

          <FloatingCard
            icon={<Truck className="h-3.5 w-3.5" aria-hidden="true" />}
            title="Transfer tracking"
            rows={
              <>
                <span className={rowClass}>
                  <span>Dispatch</span>
                  <span>Recorded</span>
                </span>
                <span className={rowClass}>
                  <span>Return date</span>
                  <span>Logged</span>
                </span>
              </>
            }
            className="absolute -bottom-7 left-2 hidden sm:block lg:-bottom-9 lg:left-6"
          />
        </div>
      </Container>
    </section>
  );
}
