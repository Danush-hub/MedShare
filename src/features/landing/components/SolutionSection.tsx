import { CircleCheck, ArrowRight } from 'lucide-react';
import { LANDING_SECTIONS, ROUTES } from '@/constants';
import { CtaLink } from './CtaLink';
import { NetworkGraphic } from './NetworkGraphic';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';

const BENEFITS = [
  'Discover potentially available equipment.',
  'Send structured requests to supplying institutions.',
  'Coordinate approvals and handovers.',
  'Track transfers and returns.',
  'Maintain relevant equipment-condition and maintenance records.',
];

/** Platform introduction: what the proposed MedShare workflow covers. */
export function SolutionSection() {
  return (
    <Section
      id={LANDING_SECTIONS.about}
      tone="page"
      labelledBy="solution-heading"
      className="border-b border-line"
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            id="solution-heading"
            align="left"
            eyebrow="The Proposed Solution"
            title="Introducing MedShare"
            description="A coordinated digital workflow for responsible medical equipment sharing."
          />

          <ul className="mt-8 space-y-3.5">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-ink sm:text-[0.9375rem]">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <CtaLink to={ROUTES.signup} size="lg">
              Get Started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </CtaLink>
          </div>
        </div>

        <figure className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
          <NetworkGraphic className="mx-auto max-w-md" tone="light" />
          <figcaption className="mt-4 border-t border-line pt-4 text-center text-xs text-ink-subtle">
            Conceptual view: participating hospitals and clinics coordinate through one shared
            workflow. Institutions shown are illustrative, not partners.
          </figcaption>
        </figure>
      </div>
    </Section>
  );
}
