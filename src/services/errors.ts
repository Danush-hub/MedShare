/**
 * Standardized service error used by every data source (mock store today,
 * REST API later). UI components catch `ServiceError` (or normalize unknown
 * throwables with `toServiceError`) and can display `message` directly —
 * messages are user-safe and never contain stack traces.
 */

import type { ApiErrorCode, ApiError } from '@/types';

/**
 * Machine-readable categories shared by mock and future HTTP implementations.
 * - `NETWORK`: network-level failure when API mode is eventually enabled.
 * - `NOT_IMPLEMENTED`: the REST backend is proposed but not implemented yet.
 * - `CONFIGURATION`: invalid app configuration (e.g. unknown VITE_DATA_MODE).
 */
export type ServiceErrorKind =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'NETWORK'
  | 'NOT_IMPLEMENTED'
  | 'CONFIGURATION'
  | 'UNKNOWN';

export interface ServiceErrorOptions {
  /** Field-level messages, mirroring the API `ApiError.details` envelope. */
  details?: Record<string, string[]>;
  /** HTTP status equivalent, when the error maps to one. */
  status?: number;
}

/** Error thrown by every service implementation. `message` is safe to show. */
export class ServiceError extends Error {
  readonly kind: ServiceErrorKind;
  readonly details?: Record<string, string[]>;
  readonly status?: number;

  constructor(kind: ServiceErrorKind, message: string, options: ServiceErrorOptions = {}) {
    super(message);
    this.name = 'ServiceError';
    this.kind = kind;
    this.details = options.details;
    this.status = options.status;
  }
}

/** Type guard for error handling in UI code. */
export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof ServiceError;
}

/** Generic replacement for unexpected failures — never shows a stack trace. */
export const GENERIC_ERROR_MESSAGE =
  'Something went wrong while processing this action. Please try again.';

/** Normalizes any throwable into a `ServiceError` with a user-safe message. */
export function toServiceError(error: unknown): ServiceError {
  if (error instanceof ServiceError) return error;
  if (typeof error === 'string' && error.length > 0) {
    return new ServiceError('UNKNOWN', error);
  }
  return new ServiceError('UNKNOWN', GENERIC_ERROR_MESSAGE);
}

/** Maps an API error code (docs/API_CONTRACT.md) to a service error kind. */
export function serviceErrorKindFromApiErrorCode(code: ApiErrorCode): ServiceErrorKind {
  switch (code) {
    case 'VALIDATION_ERROR':
      return 'VALIDATION';
    case 'NOT_FOUND':
      return 'NOT_FOUND';
    case 'UNAUTHORIZED':
      return 'UNAUTHORIZED';
    case 'FORBIDDEN':
      return 'FORBIDDEN';
    case 'CONFLICT':
      return 'CONFLICT';
    case 'RATE_LIMITED':
      return 'CONFLICT';
    case 'INTERNAL_ERROR':
      return 'UNKNOWN';
  }
}

/** Type guard for error response bodies matching the `ApiError` envelope. */
export function isApiErrorPayload(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<ApiError>;
  return typeof candidate.code === 'string' && typeof candidate.message === 'string';
}
