import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { LANDING_SECTIONS, ROUTES } from '@/constants';
import { CtaLink } from './CtaLink';

/** Closing banner inviting reviewers to continue into the product flow. */
export function FinalCTASection() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="scroll-mt-28 bg-primary-light py-20 lg:py-24"
    >
      <Container>
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-card border border-primary-100 bg-surface px-6 py-14 text-center shadow-card sm:px-12">
          <div aria-hidden="true" className="brand-glow pointer-events-none absolute inset-0" />
          <div className="relative">
            <p className="eyebrow-label">Get Started</p>
            <h2
              id="final-cta-heading"
              className="mx-auto mt-4 max-w-2xl text-2xl font-bold leading-[1.25] tracking-tight text-ink sm:text-3xl lg:text-[2.375rem]"
            >
              Let&rsquo;s Build a More Connected Healthcare Network.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
              Explore how a coordinated approach to equipment sharing could help hospitals and
              clinics prepare for changing needs.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <CtaLink to={ROUTES.signup} size="lg">
                Get Started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </CtaLink>
              <CtaLink anchor={LANDING_SECTIONS.howItWorks} size="lg" variant="outline">
                Learn How It Works
              </CtaLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
