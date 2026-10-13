import { cn } from '@/lib/cn';

type LogoVariant = 'default' | 'onBrand';

interface MedShareMarkProps {
  /** Pixel size of the square mark (wordmark scales alongside). */
  size?: number;
  className?: string;
  /** `default` for light surfaces, `onBrand` for blue/navy surfaces. */
  variant?: LogoVariant;
  title?: string;
}

/**
 * The MedShare symbol: a medical cross inside a rounded badge, joined to
 * connected nodes that represent secure equipment sharing between facilities.
 * Rendered as local SVG (no remote asset dependency).
 */
export function MedShareMark({
  size = 36,
  className,
  variant = 'default',
  title = 'MedShare symbol',
}: MedShareMarkProps) {
  const badgeFill = variant === 'onBrand' ? '#FFFFFF' : '#1769AA';
  const crossFill = variant === 'onBrand' ? '#1769AA' : '#FFFFFF';
  const nodeFill = variant === 'onBrand' ? '#EAF4FF' : '#70B0EE';
  const connectorStroke = variant === 'onBrand' ? '#A9CFF6' : '#A9CFF6';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={cn('shrink-0', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* Badge */}
      <rect x="4" y="4" width="40" height="40" rx="12" fill={badgeFill} />
      {/* Connector lines (sharing motif) */}
      <g stroke={connectorStroke} strokeWidth="2" strokeLinecap="round" opacity="0.9">
        <line x1="24" y1="24" x2="38" y2="12" />
        <line x1="24" y1="24" x2="38" y2="36" />
        <line x1="24" y1="24" x2="10" y2="30" />
      </g>
      {/* Medical cross */}
      <g fill={crossFill}>
        <rect x="21" y="15" width="6" height="18" rx="2" />
        <rect x="15" y="21" width="18" height="6" rx="2" />
      </g>
      {/* Connected nodes */}
      <g fill={nodeFill}>
        <circle cx="38" cy="12" r="4" />
        <circle cx="38" cy="36" r="4" />
        <circle cx="10" cy="30" r="4" />
      </g>
    </svg>
  );
}

interface MedShareLogoProps extends MedShareMarkProps {
  /** Whether to render the "MedShare" wordmark next to the mark. */
  showWordmark?: boolean;
  /** Wordmark text size in rem via inline style for consistent scaling. */
  wordmarkClassName?: string;
}

/**
 * Full brand lockup: symbol + "MedShare" wordmark.
 * Works on white and blue backgrounds via the `variant` prop.
 */
export function MedShareLogo({
  size = 36,
  className,
  variant = 'default',
  showWordmark = true,
  wordmarkClassName,
}: MedShareLogoProps) {
  const wordmarkColor = variant === 'onBrand' ? 'text-white' : 'text-primary-navy';
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <MedShareMark size={size} variant={variant} />
      {showWordmark && (
        <span
          className={cn(
            'font-display font-bold tracking-tight leading-none',
            wordmarkColor,
            wordmarkClassName,
          )}
          style={{ fontSize: `${Math.max(1, size / 40)}rem` }}
        >
          Med<span className={variant === 'onBrand' ? 'text-primary-light' : 'text-primary'}>Share</span>
        </span>
      )}
    </span>
  );
}
