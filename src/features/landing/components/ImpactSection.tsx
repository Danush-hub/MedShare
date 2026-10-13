import { CalendarClock, Eye, Workflow } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { LANDING_SECTIONS } from '@/constants';
import { NetworkGraphic } from './NetworkGraphic';
import { SectionHeading } from './SectionHeading';

const OUTCOMES = [
  {
    icon: Eye,
    title: 'Better visibility',
    description: 'A clearer view of resources that institutions may choose to make available.',
  },
  {
    icon: Workflow,
    title: 'More organized coordination',
    description: 'Requests, approvals and handovers documented in one shared process.',
  },
  {
    icon: CalendarClock,
    title: 'Improved flexibility',
    description: 'Temporary needs can be planned around agreed dates and returns.',
  },
];

/** Intended outcomes of the concept — deliberately free of invented statistics. */
export function ImpactSection() {
  return (
    <section
      id={LANDING_SECTIONS.impact}
      aria-labelledby="impact-heading"
      className="brand-panel scroll-mt-28 py-20 text-white lg:py-24"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <SectionHeading
              id="impact-heading"
              align="left"
              tone="brand"
              eyebrow="Our Impact"
              title="Make Healthcare Resources Work Together"
            />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-primary-100">
              MedShare is designed around a simple idea: responsible collaboration can help
              healthcare institutions make more informed use of available resources.
            </p>

            <ul className="mt-9 space-y-5">
              {OUTCOMES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{title}</span>
                    <span className="mt-1 block max-w-md text-sm leading-relaxed text-primary-100">
                      {description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-white/20 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            <NetworkGraphic tone="brand" />
            <p className="mt-4 text-center text-xs text-primary-100">
              Illustrative network model — no partner institutions are claimed at this stage.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
