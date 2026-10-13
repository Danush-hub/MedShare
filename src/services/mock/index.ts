import type { AppServices } from '../contracts';
import type { WorkspaceAccess } from './access';
import { createMockActivityService, createMockHospitalService, createMockSettingsService } from './directory';
import { createMockEquipmentService } from './equipment';
import { createMockRequestService } from './requests';
import { createMockTransferService } from './transfers';

export { mockAuthService } from './auth';
export type { WorkspaceAccess } from './access';

/**
 * Assembles the mock service set on top of the centralized workspace store.
 * All seven feature services share one dataset, so equipment, requests,
 * transfers, dashboard metrics and activity history keep referencing the
 * same records — exactly as the direct-store prototype did.
 *
 * `auth` is included via the module-level mock session service; the factory
 * decides whether mock or http placeholders are used.
 */
export function createMockServices(access: WorkspaceAccess): Omit<AppServices, 'auth'> {
  return {
    hospitals: createMockHospitalService(access),
    equipment: createMockEquipmentService(access),
    requests: createMockRequestService(access),
    transfers: createMockTransferService(access),
    activity: createMockActivityService(access),
    settings: createMockSettingsService(access),
  };
}
