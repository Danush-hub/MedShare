import { cn } from '@/lib/cn';

interface NetworkGraphicProps {
  className?: string;
  /** `brand` is for navy/blue bands, `light` for white surfaces. */
  tone?: 'light' | 'brand';
  /** Accessible description of the diagram. */
  title?: string;
}

const NODES = [
  { x: 60, y: 56, label: 'Hospital' },
  { x: 260, y: 34, label: 'Clinic' },
  { x: 340, y: 150, label: 'Hospital' },
  { x: 250, y: 268, label: 'Clinic' },
  { x: 60, y: 240, label: 'Hospital' },
] as const;

/**
 * Illustrative network diagram: participating institutions connected through a
 * central MedShare coordination hub. Pure SVG, so it always renders and scales
 * sharply — no external asset required.
 */
export function NetworkGraphic({ className, tone = 'light', title }: NetworkGraphicProps) {
  const isBrand = tone === 'brand';
  const line = isBrand ? '#70B0EE' : '#A9CFF6';
  const nodeFill = isBrand ? 'rgba(255,255,255,0.10)' : '#FFFFFF';
  const nodeStroke = isBrand ? '#70B0EE' : '#DCE6F0';
  const label = isBrand ? '#EAF4FF' : '#64748B';
  const hubFill = isBrand ? '#EAF4FF' : '#1769AA';
  const hubCross = isBrand ? '#1769AA' : '#FFFFFF';
  const windowFill = isBrand ? '#12304A' : '#FFFFFF';

  return (
    <svg
      viewBox="0 0 400 320"
      role="img"
      aria-label={
        title ?? 'Diagram of hospitals and clinics connected through the MedShare platform'
      }
      className={cn('h-auto w-full', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title ?? 'Hospital network diagram'}</title>
      {/* Connections between institutions and the central hub */}
      <g stroke={line} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.85">
        {NODES.map((node) => (
          <line key={`link-${node.x}-${node.y}`} x1="200" y1="160" x2={node.x} y2={node.y} />
        ))}
      </g>

      {/* Institution nodes */}
      {NODES.map((node) => (
        <g key={`node-${node.x}-${node.y}`}>
          <circle
            cx={node.x}
            cy={node.y}
            r="26"
            fill={nodeFill}
            stroke={nodeStroke}
            strokeWidth="1.5"
          />
          {/* Simplified building glyph */}
          <g transform={`translate(${node.x - 10} ${node.y - 12})`}>
            <rect x="1" y="4" width="18" height="15" rx="2" fill={line} opacity="0.9" />
            <rect x="7" y="12" width="6" height="7" rx="1" fill={windowFill} />
            <rect x="4" y="7" width="3" height="3" fill={windowFill} opacity="0.85" />
            <rect x="13" y="7" width="3" height="3" fill={windowFill} opacity="0.85" />
          </g>
          <text
            x={node.x}
            y={node.y + 44}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill={label}
          >
            {node.label}
          </text>
        </g>
      ))}

      {/* Central MedShare hub */}
      <circle cx="200" cy="160" r="42" fill={hubFill} opacity={isBrand ? 0.14 : 0.09} />
      <circle cx="200" cy="160" r="30" fill={hubFill} />
      <g fill={hubCross}>
        <rect x="196" y="146" width="8" height="28" rx="2.5" />
        <rect x="186" y="156" width="28" height="8" rx="2.5" />
      </g>
      <text
        x="200"
        y="212"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={isBrand ? '#FFFFFF' : '#12304A'}
      >
        MedShare
      </text>
    </svg>
  );
}
