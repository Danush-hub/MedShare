import type { User } from '@/types';
import type { AuthService } from '../contracts/auth';
import { throwNotImplemented } from './notImplemented';

/**
 * HTTP auth placeholder — implements the `AuthService` contract against the
 * proposed endpoints in docs/API_CONTRACT.md §1 without calling them.
 *
 * When the backend lands, each method becomes an `apiClient` call, e.g.:
 *
 * ```ts
 * login: async (username, password) =>
 *   (await apiClient.post<User>('/v1/auth/login', { username, password })).data,
 * ```
 *
 * No credentials are stored and no tokens are fabricated here.
 * `getCurrentUser`/`hasSession` report "signed out" rather than throwing, so
 * the app can still boot in api mode and show the limitation on first login
 * attempt.
 */
export const httpAuthService: AuthService = {
  async login(): Promise<User> {
    return throwNotImplemented('POST', '/api/v1/auth/login');
  },

  async logout(): Promise<void> {
    throwNotImplemented('POST', '/api/v1/auth/logout');
  },

  getCurrentUser(): User | null {
    // Without a backend there is no session to restore.
    return null;
  },

  hasSession(): boolean {
    return false;
  },
};
