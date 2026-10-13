import { createContext, useContext } from 'react';
import type { AuthUser } from './types';

/**
 * Authentication state contract for the prototype.
 *
 * The provider is backed by the active `AuthService` (mock demo session today,
 * Spring Boot API later). This is demonstration auth, not production auth.
 * Only the service behind the provider changes — every consumer (guards,
 * forms, topbar) keeps working unchanged.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  status: AuthStatus;
  /** The current user, or null when signed out. */
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** False while the initial session check is still running. */
  isReady: boolean;
  /** Validate credentials and open a session. Throws `ServiceError` on rejection. */
  signIn: (username: string, password: string) => Promise<void>;
  /** Clear the current session. */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Access the auth context. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>.');
  }
  return ctx;
}
