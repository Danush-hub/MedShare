/**
 * The Spring Boot API serializes optional record fields as JSON `null`
 * (e.g. `description`, `notes`, `rejectReason`, an activity `status`), while
 * the frontend domain types in `src/types/domain.ts` model them as optional
 * properties (`field?: string`). This helper recursively drops `null`-valued
 * keys so API responses match the frontend types exactly — no substitute
 * values are ever fabricated for missing server data.
 */
export function stripNulls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripNulls(item)) as T;
  }
  if (typeof value === 'object' && value !== null) {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (entry !== null) {
        output[key] = stripNulls(entry);
      }
    }
    return output as T;
  }
  return value;
}
