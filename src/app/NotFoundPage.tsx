import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { MedShareLogo } from '@/components/common/MedShareLogo';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';

/** Global 404 for unmatched routes. */
export function NotFoundPage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col bg-surface-background">
      <Container className="flex flex-1 flex-col items-center justify-center py-20 text-center">
        <Link to={ROUTES.home} className="rounded-field" aria-label="MedShare home">
          <MedShareLogo size={34} />
        </Link>
        <span className="mt-10 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-6 h-display">Page not found</h1>
        <p className="mt-3 max-w-md text-sm text-ink-muted">
          The page you are looking for doesn&apos;t exist or may have moved.
        </p>
        <Link to={ROUTES.home} className="mt-8">
          <Button>Back to home</Button>
        </Link>
      </Container>
    </main>
  );
}
