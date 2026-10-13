import { BadgeCheck, ClipboardList, Search, Truck } from 'lucide-react';
import { LANDING_SECTIONS } from '@/constants';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';

const STEPS = [
  {
    icon: ClipboardList,
    title: 'List Equipment',
    description:
      'An authorized institution records equipment details, availability, location, condition, and relevant documentation.',
  },
  {
    icon: Search,
    title: 'Discover and Request',
    description:
      'Another institution searches the catalogue and submits a request for suitable equipment.',
  },
  {
    icon: BadgeCheck,
    title: 'Review and Approve',
    description:
      'The supplying institution reviews availability, suitability, timing, and authorization before accepting the request.',
  },
  {
    icon: Truck,
    title: 'Coordinate and Track',
    description:
      'The institutions coordinate dispatch, handover, receipt, and return using a documented workflow.',
  },
];

/** Four-step sharing process: timeline on desktop, sequence on mobile. */
export function HowItWorksSection() {
  return (
    <Section
      id={LANDING_SECTIONS.howItWorks}
      tone="muted"
      labelledBy="how-it-works-heading"
      className="border-b border-line"
    >
      <SectionHeading
        id="how-it-works-heading"
        eyebrow="How It Works"
        title="From Listing to Return, in Four Documented Steps."
        description="Each step keeps the responsible institutions in control of availability, suitability and authorization decisions."
      />

      <div className="relative mt-14">
        <span
          aria-hidden="true"
          className="absolute left-[12%] right-[12%] top-6 hidden border-t-2 border-dashed border-primary-200 lg:block"
        />
        <ol className="grid gap-10 lg:grid-cols-4 lg:gap-8">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="relative flex gap-5 lg:block lg:gap-0">
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 left-6 top-14 w-px bg-primary-200 lg:hidden"
                />
              )}
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-base font-bold text-primary shadow-card">
                {index + 1}
              </div>
              <div className="lg:mt-7">
                <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
                  <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
