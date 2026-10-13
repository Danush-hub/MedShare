/**
 * Shared API/response envelope types for the future Spring Boot backend.
 * No requests are performed in this phase — these describe the proposed
 * contracts documented in docs/API_CONTRACT.md.
 */

import type { UserRole } from './domain';

/** Standard paginated list envelope the backend is expected to return. */
export interface PaginatedResponse<T> {
  items: T[];
  /** Zero-based page index. */
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Machine-readable application error codes used by the API envelope. */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

/** Error envelope shape expected from the backend (see docs/API_CONTRACT.md). */
export interface ApiError {
  code: ApiErrorCode;
  message: string;
  /** Optional field-level validation messages keyed by field name. */
  details?: Record<string, string[]>;
  /** Server-side correlation id for support tracing. */
  requestId?: string;
}

/**
 * Authenticated session placeholder.
 * The real token/session strategy is decided when the auth backend lands;
 * this only lets the frontend wire an auth context without fake credentials.
 */
export interface AuthSession {
  userId: string;
  institutionId?: string;
  role: UserRole;
  /** Opaque access token slot — never populated with a hardcoded value. */
  accessToken: string | null;
  issuedAt: string;
  expiresAt: string | null;
}
