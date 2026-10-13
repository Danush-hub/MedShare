import type { User } from '@/types';
import { ServiceError } from '../errors';
import type { AuthService } from '../contracts/auth';

/**
 * MOCK authentication implementation — a frontend demonstration only.
 *
 * The static administrator credentials below exist exclusively in this file
 * and are NOT a real authentication mechanism: the "session" is a plain
 * object in sessionStorage and route protection is bypassable by any
 * determined client. When the Spring Boot auth API lands, the HTTP
 * placeholder in `src/services/http/auth.ts` is replaced by a real
 * implementation of the same `AuthService` contract — nothing in the UI
 * changes.
 */

/** Key for the (non-sensitive) session object. The password is never stored. */
const SESSION_KEY = 'medshare.demo.session';

/** Static demonstration credentials. Mock-only — never move these to a contract. */
const DEMO_CREDENTIALS = { username: 'admin', password: '1234' } as const;

/** The minimal user surfaced to the UI after a successful demo login. */
const DEMO_USER: User = {
  id: 'usr-demo-admin',
  username: 'admin',
  displayName: 'MedShare Administrator',
  role: 'ADMIN',
};

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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAuthService: AuthService = {
  async login(username, password) {
    // Brief pause so the form can show a realistic loading state. No network.
    await delay(600);

    const matches =
      username.trim() === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password;

    if (!matches) {
      // Single, generic message — never reveal which field was wrong.
      throw new ServiceError('UNAUTHORIZED', 'Invalid username or password. Please try again.', {
        status: 401,
      });
    }

    store.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
    return DEMO_USER;
  },

  async logout() {
    store.removeItem(SESSION_KEY);
  },

  hasSession() {
    return this.getCurrentUser() !== null;
  },

  getCurrentUser() {
    try {
      const raw = store.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<User>;
      if (typeof parsed.username !== 'string') return null;
      // Re-hydrate from the known demo identity so sessions saved by earlier
      // prototypes (without `id`) still resolve to a complete user record.
      return { ...DEMO_USER, ...parsed };
    } catch {
      return null;
    }
  },
};
