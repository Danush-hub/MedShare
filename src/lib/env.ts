/**
 * Centralized, typed access to public runtime environment variables.
 * Components and services should read config through this module rather than
 * touching `import.meta.env` directly, so defaults live in one place.
 */

const raw = import.meta.env;

export const env = {
  /** Base URL for the future Spring Boot REST API (not called yet). */
  apiBaseUrl: raw.VITE_API_BASE_URL ?? '/api',
  /** Current runtime environment. */
  appEnv: raw.VITE_APP_ENV ?? 'development',
  /**
   * Which service implementation the factory selects.
   * `'mock'` (default) or `'api'` — validated in `services/config/dataMode.ts`,
   * which raises a clear configuration error for anything else.
   */
  dataMode: raw.VITE_DATA_MODE ?? 'mock',
  isDev: (raw.VITE_APP_ENV ?? 'development') === 'development',
  isProd: raw.VITE_APP_ENV === 'production',
} as const;
