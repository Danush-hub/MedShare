import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Container } from './Container';
import { PageHeader } from './PageHeader';

interface PageContainerProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Wrap content in a `<main>` landmark (default true). Turn off when nested. */
  asMain?: boolean;
  /** id target for the accessibility skip link. */
  id?: string;
}

/**
 * Standard page scaffold: vertical rhythm, horizontal container and a consistent
 * header. Every route page should render inside this to keep spacing uniform.
 */
export function PageContainer({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
  asMain = true,
  id = 'main-content',
}: PageContainerProps) {
  const Wrapper = asMain ? 'main' : 'div';
  return (
    <Wrapper id={id} className={cn('animate-fade-in py-8 sm:py-10', className)}>
      <Container>
        <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
        <div className="mt-6">{children}</div>
      </Container>
    </Wrapper>
  );
}
