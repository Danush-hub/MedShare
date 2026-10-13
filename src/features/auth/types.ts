/**
 * Auth-facing types for the prototype.
 *
 * The authenticated identity is the canonical `User` model
 * (`src/types/domain.ts`), so the exact same shape is used for the local
 * demo session today and for a future `GET /api/v1/auth/me` response.
 *
 * There is deliberately no bespoke error class here: authentication failures
 * are signalled with the shared `ServiceError` (kind `UNAUTHORIZED`) thrown by
 * the active `AuthService`, keeping the UI independent of the data source.
 */
import type { User } from '@/types';

/** The signed-in identity exposed to the UI via `useAuth()`. */
export type AuthUser = User;
