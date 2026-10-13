import { FileCheck2, Handshake, ScrollText, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { LANDING_SECTIONS } from '@/constants';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';

const PRINCIPLES = [
  {
    icon: UserCheck,
    title: 'Institution and user authorization',
    description: 'Access to listing, requesting and approving is granted to authorized roles only.',
  },
  {
    icon: FileCheck2,
    title: 'Condition and documentation review',
    description:
      'Equipment condition, inspection and maintenance records are reviewed before approval.',
  },
  {
    icon: ScrollText,
    title: 'Clear dispatch and receipt records',
    description:
      'Each handover is recorded with date, custodian and confirmed receipt by both parties.',
  },
  {
    icon: Handshake,
    title: 'Defined return, incident and liability processes',
    description: 'Returns and exceptions follow documented steps agreed between the institutions.',
  },
];

/** Responsibility framing: what careful sharing requires, without claiming approval. */
export function SafetySection() {
  return (
    <Section
      id={LANDING_SECTIONS.safety}
      tone="white"
      labelledBy="safety-heading"
      className="border-t border-line"
    >
      <SectionHeading
        id="safety-heading"
        eyebrow="Safety and Trust"
        title="Sharing Responsibly Comes First"
        description="Medical equipment sharing requires more than availability. It requires clear responsibilities, appropriate checks, and documented handovers."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {PRINCIPLES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="flex h-full items-start gap-4 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-field bg-primary-light">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <CardContent className="space-y-1.5 p-0">
              <CardTitle className="text-[0.9375rem]">{title}</CardTitle>
              <CardDescription className="leading-relaxed">{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-3xl rounded-card border border-line bg-primary-light px-5 py-4 text-center text-xs leading-relaxed text-ink-muted">
        MedShare is a proposed coordination platform. Equipment suitability, regulatory compliance,
        and authorization must be assessed by the responsible institutions and qualified personnel.
      </p>
    </Section>
  );
}
