import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { createAuthService } from '@/services/config/factory';
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext';
import type { AuthUser } from './types';

/**
 * Prototype auth provider.
 *
 * It depends only on the `AuthService` contract (resolved by the service
 * factory from `VITE_DATA_MODE`), never on the hardcoded demo credentials —
 * those live solely in the mock implementation. The initial session is read
 * synchronously, so route guards are correct on first paint: a reload or a
 * direct visit to `/app` re-checks the session without flashing protected UI.
 *
 * This is frontend demonstration auth; route protection is convenience, not a
 * security boundary against a determined client.
 */
const authService = createAuthService();

export function AuthProvider({ children }: { children: ReactNode }) {
  // Read once, synchronously, so refreshes restore the session instantly.
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const signIn = useCallback(async (username: string, password: string) => {
    const next = await authService.login(username, password);
    setUser(next);
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const status: AuthStatus = user ? 'authenticated' : 'unauthenticated';
    return {
      status,
      user,
      isAuthenticated: user !== null,
      isReady: true,
      signIn,
      signOut,
    };
  }, [user, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
