/**
 * Minimal, dependency-free class name combiner.
 * Filters falsy values and joins with a space. Intentionally simple — a full
 * tailwind-merge can be added later if conflicting utility handling is needed.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
