import { ServiceError } from '../errors';
import type { HospitalService } from '../contracts/hospitals';
import type { ActivityService } from '../contracts/activity';
import type { SettingsService } from '../contracts/settings';
import type { WorkspaceAccess } from './access';
import { delay } from './delay';

/** Mock hospital directory backed by the centralized workspace store. */
export function createMockHospitalService(access: WorkspaceAccess): HospitalService {
  return {
    async listHospitals() {
      await delay();
      return [...access.getState().institutions];
    },

    async getHospital(id) {
      await delay();
      const found = access.getState().institutions.find((h) => h.id === id);
      if (!found) {
        throw new ServiceError('NOT_FOUND', `Institution ${id} was not found.`, { status: 404 });
      }
      return found;
    },
  };
}

/** Mock activity history backed by the centralized workspace store. */
export function createMockActivityService(access: WorkspaceAccess): ActivityService {
  return {
    async listActivities() {
      await delay();
      return [...access.getState().activities];
    },
  };
}

/** Mock settings service backed by the centralized workspace store. */
export function createMockSettingsService(access: WorkspaceAccess): SettingsService {
  return {
    async getSettings() {
      await delay();
      return { ...access.getState().settings };
    },

    async updateSettings(patch) {
      const details: Record<string, string[]> = {};
      if (patch.institution && !patch.institution.name.trim()) {
        details['institution.name'] = ['Institution name is required.'];
      }
      if (patch.user && !patch.user.displayName.trim()) {
        details['user.displayName'] = ['Display name is required.'];
      }
      if (Object.keys(details).length > 0) {
        throw new ServiceError('VALIDATION', 'Please fix the highlighted fields before saving.', {
          details,
        });
      }
      await delay();
      access.updateSettings(patch);
    },
  };
}
