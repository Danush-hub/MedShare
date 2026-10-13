import { ServiceError } from '../errors';

/**
 * Builds the explicit failure thrown by every HTTP placeholder service.
 *
 * These modules are ready to be re-pointed at `apiClient` once the Spring
 * Boot API exists, but in this phase they must NOT perform network calls or
 * pretend a backend responded — every method throws this error instead, so a
 * mis-configured `VITE_DATA_MODE=api` surfaces a clear message in the UI.
 */
export function notImplemented(method: string, path: string): ServiceError {
  return new ServiceError(
    'NOT_IMPLEMENTED',
    `The MedShare backend is not connected yet. ${method} ${path} is a proposed endpoint only (see docs/API_CONTRACT.md). Run the app with VITE_DATA_MODE=mock.`,
  );
}

/** Convenience for one-line placeholder bodies. */
export function throwNotImplemented(method: string, path: string): never {
  throw notImplemented(method, path);
}
