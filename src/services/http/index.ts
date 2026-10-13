import type { AppServices } from '../contracts';
import { throwNotImplemented } from './notImplemented';

export { httpAuthService } from './auth';
export { notImplemented, throwNotImplemented } from './notImplemented';

/**
 * HTTP service placeholders for every feature domain.
 *
 * Each method documents the proposed Spring Boot endpoint it will eventually
 * call through `apiClient` (`src/services/api/client.ts`) — and currently
 * throws an explicit `NOT_IMPLEMENTED` `ServiceError` instead of making a
 * request or fabricating a successful server response. This whole module is
 * the future integration surface: replacing a body with the sketched axios
 * call is the only change required when the backend lands.
 *
 * Example of the intended final shape (do not enable yet):
 *
 * ```ts
 * listEquipment: async () =>
 *   (await apiClient.get<PaginatedResponse<MedicalEquipment>>('/v1/equipment')).data.items,
 * ```
 */
export function createHttpServices(): Omit<AppServices, 'auth'> {
  return {
    hospitals: {
      listHospitals: () => throwNotImplemented('GET', '/api/v1/hospitals'),
      getHospital: () => throwNotImplemented('GET', '/api/v1/hospitals/{id}'),
    },

    equipment: {
      listEquipment: () => throwNotImplemented('GET', '/api/v1/equipment'),
      getEquipment: () => throwNotImplemented('GET', '/api/v1/equipment/{id}'),
      createEquipment: () => throwNotImplemented('POST', '/api/v1/equipment'),
      updateEquipment: () => throwNotImplemented('PATCH', '/api/v1/equipment/{id}'),
      deleteEquipment: () => throwNotImplemented('DELETE', '/api/v1/equipment/{id}'),
      getDeleteBlocker: () => throwNotImplemented('DELETE', '/api/v1/equipment/{id} (constraint check)'),
    },

    requests: {
      listRequests: () => throwNotImplemented('GET', '/api/v1/requests'),
      getRequest: () => throwNotImplemented('GET', '/api/v1/requests/{id}'),
      createRequest: () => throwNotImplemented('POST', '/api/v1/requests'),
      approveRequest: () => throwNotImplemented('POST', '/api/v1/requests/{id}/approve'),
      rejectRequest: () => throwNotImplemented('POST', '/api/v1/requests/{id}/reject'),
      cancelRequest: () => throwNotImplemented('POST', '/api/v1/requests/{id}/cancel'),
      getApprovalBlocker: () => throwNotImplemented('POST', '/api/v1/requests/{id}/approve (constraint check)'),
    },

    transfers: {
      listTransfers: () => throwNotImplemented('GET', '/api/v1/transfers'),
      getTransfer: () => throwNotImplemented('GET', '/api/v1/transfers/{id}'),
      createTransfer: () => throwNotImplemented('POST', '/api/v1/transfers'),
      updateTransferStatus: () => throwNotImplemented('POST', '/api/v1/transfers/{id}/{transition}'),
      getTransitionOptions: () => throwNotImplemented('GET', '/api/v1/transfers/{id}'),
    },

    activity: {
      listActivities: () => throwNotImplemented('GET', '/api/v1/activities'),
    },

    settings: {
      getSettings: () => throwNotImplemented('GET', '/api/v1/settings'),
      updateSettings: () => throwNotImplemented('PATCH', '/api/v1/settings'),
    },
  };
}
