import type { HTMLAttributes, ReactNode } from 'react';
import { Container } from '@/components/common/Container';
import { cn } from '@/lib/cn';

type SectionTone = 'page' | 'white' | 'muted';

const toneClasses: Record<SectionTone, string> = {
  page: 'bg-surface-background',
  white: 'bg-surface',
  muted: 'bg-primary-light',
};

interface SectionProps extends Pick<HTMLAttributes<HTMLElement>, 'id'> {
  /** Visual band. `page` is the default canvas, `white` and `muted` alternate rhythm. */
  tone?: SectionTone;
  /** Heading id, so the landmark is announced with its own section title. */
  labelledBy?: string;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}

/**
 * Landing page section shell: consistent vertical rhythm, horizontal container
 * and extra scroll margin so the sticky header never covers a section heading.
 */
export function Section({
  id,
  tone = 'page',
  labelledBy,
  className,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('scroll-mt-28 py-16 sm:py-20 lg:py-24', toneClasses[tone], className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
