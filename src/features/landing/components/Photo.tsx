import { useState } from 'react';
import { MedShareMark } from '@/components/common/MedShareLogo';
import { cn } from '@/lib/cn';

interface PhotoProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  /** Render eagerly for above-the-fold imagery. */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

/**
 * Responsive photograph with graceful degradation: if the remote asset fails,
 * a calm branded panel replaces it instead of a broken-image icon.
 */
export function Photo({
  src,
  srcSet,
  sizes,
  alt,
  priority = false,
  className,
  imgClassName,
}: PhotoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-primary-light via-surface to-primary-100',
        className,
      )}
    >
      {failed ? (
        <div aria-hidden="true" className="flex h-full min-h-40 items-center justify-center">
          <MedShareMark size={88} className="opacity-40" />
        </div>
      ) : (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  );
}
