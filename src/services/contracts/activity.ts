import type { Activity } from '@/types';

/**
 * Activity history contract. Entries are produced as side effects of the
 * equipment / request / transfer / settings services — the UI never appends
 * to the log directly.
 */
export interface ActivityService {
  /** Newest-first activity entries for the current workspace. */
  listActivities: () => Promise<Activity[]>;
}
