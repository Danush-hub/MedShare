/**
 * Landing imagery helpers.
 *
 * Photography is loaded from a reliable public image CDN (Unsplash) because the
 * prototype repository ships without binary assets. Every usage goes through
 * `Photo`, which degrades to a branded panel if a remote image cannot load —
 * so the page never shows a broken-image icon.
 */

const UNSPLASH_BASE = 'https://images.unsplash.com/photo-';

/** Build a width-constrained, format-optimised CDN url for a photo id. */
export function unsplashPhoto(id: string, width: number, height?: number): string {
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', q: '80', w: String(width) });
  if (height) params.set('h', String(height));
  return `${UNSPLASH_BASE}${id}?${params.toString()}`;
}

/** `srcSet` candidate list for the same photo id, from small to large. */
export function unsplashSrcSet(id: string, widths: number[], height?: number): string {
  return widths.map((width) => `${unsplashPhoto(id, width, height)} ${width}w`).join(', ');
}

/** Photo identifiers used by the landing page, with honest, descriptive alt text. */
export const LANDING_PHOTOS = {
  hero: {
    id: '1559839734-2b71ea197ec2',
    alt: 'A healthcare professional in a modern clinical setting.',
  },
  emergencyPreparedness: {
    id: '1519494026892-80bbd2d6fd0d',
    alt: 'A modern healthcare facility interior.',
  },
  smallerClinics: {
    id: '1576091160399-112ba8d25d1d',
    alt: 'A clinician working with patient information on a computer.',
  },
  plannedSharing: {
    id: '1551190822-a9333d879b1f',
    alt: 'A clinical team working with medical devices.',
  },
} as const;
