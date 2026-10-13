import { PackageOpen, ShieldAlert, Siren } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';

const CHALLENGES = [
  {
    icon: Siren,
    title: 'Unexpected Demand',
    description:
      'Hospitals may experience sudden increases in demand during emergencies or periods of high patient volume.',
  },
  {
    icon: PackageOpen,
    title: 'Limited Resources',
    description:
      'Smaller healthcare facilities may not be able to purchase every piece of equipment they occasionally need.',
  },
  {
    icon: ShieldAlert,
    title: 'Coordination Challenges',
    description:
      'Locating available equipment, confirming suitability, securing approvals, and coordinating transportation can involve multiple disconnected steps.',
  },
];

/** The coordination problem the platform addresses, framed honestly. */
export function ProblemSection() {
  return (
    <Section tone="white" labelledBy="problem-heading" className="border-b border-line">
      <SectionHeading
        id="problem-heading"
        eyebrow="The Coordination Gap"
        title="When Equipment Is Needed, Coordination Matters."
        description="Healthcare institutions can face changing equipment needs, while suitable resources may exist elsewhere in the network."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {CHALLENGES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="flex h-full flex-col">
            <CardHeader className="gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-field bg-primary-light">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="leading-relaxed">{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
