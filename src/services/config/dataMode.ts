import { ServiceError } from '../errors';

/**
 * Data-mode selection driven by `VITE_DATA_MODE`.
 *
 * - `mock` (default): services run against the centralized local store.
 *   The app works fully offline; this is the only mode with real behavior.
 * - `api`: services resolve to the placeholders in `src/services/http`.
 *   They fail loudly with NOT_IMPLEMENTED — no HTTP request is sent and no
 *   fake server response is pretended until the Spring Boot backend exists.
 *
 * Any other configured value is a configuration error, surfaced as a clear
 * message instead of silently falling back to a backend.
 */
export type DataMode = 'mock' | 'api';

const SUPPORTED: readonly DataMode[] = ['mock', 'api'];

function isDataMode(value: string): value is DataMode {
  return (SUPPORTED as readonly string[]).includes(value);
}

export function resolveDataMode(raw: string): DataMode {
  const normalized = raw.trim().toLowerCase();
  if (isDataMode(normalized)) return normalized;
  throw new ServiceError(
    'CONFIGURATION',
    `Unsupported VITE_DATA_MODE "${raw}". Supported values: mock | api (default: mock). Set VITE_DATA_MODE=mock in your .env file to keep using the local prototype.`,
  );
}
