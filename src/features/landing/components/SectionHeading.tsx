import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  /** Heading id — paired with `Section`'s `labelledBy` for an accessible landmark. */
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  /** `brand` renders light-on-navy for the impact and closing bands. */
  tone?: 'default' | 'brand';
  className?: string;
}

/** Section eyebrow + title + supporting line, consistent across the landing page. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'default',
  className,
}: SectionHeadingProps) {
  const isBrand = tone === 'brand';
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'eyebrow-label',
            isBrand && 'text-primary-200',
            align === 'center' && 'sm:tracking-[0.18em]',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          'max-w-3xl text-2xl font-bold leading-[1.2] tracking-tight sm:text-3xl lg:text-[2.375rem]',
          isBrand ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed sm:text-[1.0625rem]',
            isBrand ? 'text-primary-100' : 'text-ink-muted',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
