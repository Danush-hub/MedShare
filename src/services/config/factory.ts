import type { AppServices } from '../contracts';
import { mockAuthService, createMockServices, type WorkspaceAccess } from '../mock';
import { createHttpServices, httpAuthService } from '../http';
import { env } from '@/lib/env';
import { resolveDataMode, type DataMode } from './dataMode';

export { resolveDataMode, type DataMode } from './dataMode';

/**
 * The only place that decides *which* service implementation the app uses.
 * No DI framework — a plain factory keyed by `VITE_DATA_MODE` (default:
 * `mock`). The workspace-backed services receive the centralized store
 * access seam; auth is mode-selected but store-independent.
 */
export function createServices(mode: DataMode, access: WorkspaceAccess): AppServices {
  switch (mode) {
    case 'mock':
      return { auth: mockAuthService, ...createMockServices(access) };
    case 'api':
      // Real HTTP adapters calling the Spring Boot backend through the
      // configured Axios client (`VITE_API_BASE_URL`).
      return { auth: httpAuthService, ...createHttpServices() };
  }
}

/** Convenience for callers outside the workspace tree (e.g. AuthProvider). */
export function createAuthService(): AppServices['auth'] {
  return resolveDataMode(env.dataMode) === 'api' ? httpAuthService : mockAuthService;
}
