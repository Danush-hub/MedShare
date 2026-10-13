import type { User } from '@/types';
import { apiClient } from '../api';
import type { AuthService } from '../contracts/auth';
import { stripNulls } from './normalize';

/**
 * HTTP auth implementation against the Spring Boot demo endpoints
 * (`POST /v1/auth/login`, `POST /v1/auth/logout`).
 *
 * The backend issues no token and keeps no session: the login response is
 * the `User` record only, and the session lives client-side in
 * `sessionStorage` — the same pattern as the mock service, and deliberately
 * NOT a server-validated session. `getCurrentUser`/`hasSession` therefore
 * read the local session synchronously and never call `GET /v1/auth/me`,
 * which honestly reports 401 (the server cannot identify callers).
 */

/** Key for the client-side session record. The password is never stored. */
const SESSION_KEY = 'medshare.api.session';

/** Guard against direct non-browser access (tests/SSR) without throwing. */
const store: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
  getItem: (key) => (typeof window === 'undefined' ? null : window.sessionStorage.getItem(key)),
  setItem: (key, value) => {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(key);
  },
};

export const httpAuthService: AuthService = {
  async login(username, password) {
    // 401 from the backend already normalizes to a ServiceError UNAUTHORIZED
    // with the server's generic, user-safe message (see api/client.ts).
    const user = stripNulls((await apiClient.post<User>('/v1/auth/login', { username, password })).data);
    store.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch {
      // The endpoint is a stateless no-op (always 204); the only realistic
      // failure is the backend being unreachable. The session is client-side,
      // so a failed call must not block local sign-out — same net effect as
      // the mock implementation, which only clears local storage.
    }
    store.removeItem(SESSION_KEY);
  },

  getCurrentUser() {
    try {
      const raw = store.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<User>;
      if (typeof parsed.id !== 'string' || typeof parsed.username !== 'string') return null;
      return parsed as User;
    } catch {
      return null;
    }
  },

  hasSession() {
    return this.getCurrentUser() !== null;
  },
};
