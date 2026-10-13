import type { UserSettings } from '@/types';

/**
 * User / institution settings contract.
 *
 * The prototype persists settings in the session-scoped mock store only;
 * passwords are never stored. `PATCH`-style partial updates merge into the
 * stored settings by section (institution / user / preferences).
 */
export interface SettingsService {
  getSettings: () => Promise<UserSettings>;
  /** Applies a partial update. Throws VALIDATION when required fields are empty. */
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
}
