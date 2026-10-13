import type { User } from '@/types';

/**
 * Authentication contract.
 *
 * The UI depends on this interface only — never on the hardcoded demo
 * credentials, which live exclusively in the mock implementation
 * (`src/services/mock/auth.ts`). The future Spring Boot API will provide a
 * real session behind the same contract (see docs/API_CONTRACT.md §1).
 *
 * Note: mock "auth" is a frontend demonstration and is NOT secure against a
 * malicious client; route protection here is convenience, not a boundary.
 */
export interface AuthService {
  /** Validate credentials and establish a session. Throws `ServiceError` (UNAUTHORIZED) on rejection. */
  login: (username: string, password: string) => Promise<User>;
  /** Clear the current session. */
  logout: () => Promise<void>;
  /** The current user, or null when signed out. Synchronous by design. */
  getCurrentUser: () => User | null;
  /** Whether a session currently exists. */
  hasSession: () => boolean;
}
