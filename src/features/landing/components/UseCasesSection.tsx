import { LANDING_SECTIONS } from '@/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Photo } from './Photo';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { LANDING_PHOTOS, unsplashPhoto, unsplashSrcSet } from '../media';

const USE_CASES = [
  {
    photo: LANDING_PHOTOS.emergencyPreparedness,
    title: 'Emergency Preparedness',
    description:
      'Help institutions coordinate requests when demand rises unexpectedly or during emergency response planning.',
  },
  {
    photo: LANDING_PHOTOS.smallerClinics,
    title: 'Smaller Clinics',
    description:
      'Explore access to suitable equipment for temporary or intermittent needs, subject to approval and availability.',
  },
  {
    photo: LANDING_PHOTOS.plannedSharing,
    title: 'Planned Equipment Sharing',
    description:
      'Coordinate temporary transfers between institutions for planned activities, maintenance periods, or demand fluctuations.',
  },
];

/** Scenario cards showing where a shared workflow could help. */
export function UseCasesSection() {
  return (
    <Section
      id={LANDING_SECTIONS.useCases}
      tone="page"
      labelledBy="use-cases-heading"
      className="border-y border-line"
    >
      <SectionHeading
        id="use-cases-heading"
        eyebrow="Use Cases"
        title="Designed for Changing Healthcare Needs"
        description="Illustrative scenarios for the proposed coordination workflow — every transfer still depends on institutional approval and available capacity."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {USE_CASES.map(({ photo, title, description }) => (
          <Card key={title} className="group flex h-full flex-col overflow-hidden">
            <Photo
              src={unsplashPhoto(photo.id, 900, 600)}
              srcSet={unsplashSrcSet(photo.id, [500, 700, 900], 600)}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 45vw, 92vw"
              alt={photo.alt}
              className="aspect-[16/10] w-full"
              imgClassName="transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              <CardDescription className="leading-relaxed">{description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
