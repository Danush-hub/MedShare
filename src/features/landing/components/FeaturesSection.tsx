import { BadgeCheck, Boxes, FileText, Search, ShieldCheck, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LANDING_SECTIONS } from '@/constants';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';

const FEATURES = [
  {
    icon: Boxes,
    title: 'Equipment Inventory',
    description:
      'Maintain equipment listings, quantities, availability, locations, and relevant details.',
  },
  {
    icon: Search,
    title: 'Smart Discovery',
    description: 'Search and filter by equipment category, location, and availability.',
  },
  {
    icon: FileText,
    title: 'Structured Requests',
    description:
      'Submit requests with purpose, required dates, quantity, and receiving institution details.',
  },
  {
    icon: BadgeCheck,
    title: 'Approval Workflow',
    description: 'Review and manage equipment-sharing requests before confirming a transfer.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety Documentation',
    description:
      'Record applicable inspection, maintenance, calibration, and handover information.',
  },
  {
    icon: Truck,
    title: 'Transfer Tracking',
    description: 'Track dispatch, receipt, return dates, and completion status.',
  },
];

/** Capability overview. Institutional judgement stays explicit. */
export function FeaturesSection() {
  return (
    <Section id={LANDING_SECTIONS.features} tone="white" labelledBy="features-heading">
      <SectionHeading
        id="features-heading"
        eyebrow="Features"
        title="Everything Needed for a Coordinated Sharing Workflow"
        description="MedShare organises the administrative steps around a transfer. Clinical-suitability decisions remain with the responsible institutions and qualified personnel."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="flex h-full flex-col hover:-translate-y-0.5">
            <CardHeader className="gap-3.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-field bg-primary-light">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="leading-relaxed">{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
