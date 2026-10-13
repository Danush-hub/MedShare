import type {
  Activity,
  EquipmentRequest,
  EquipmentTransfer,
  Hospital,
  MedicalEquipment,
  TransferStatus,
  UserSettings,
} from '@/types';
import { equipmentDeleteBlocker, requestApprovalBlocker } from '@/features/workspace/rules';
import type { WorkspaceState } from '@/features/workspace/types';
import { apiClient } from '../api';
import type { AppServices, EquipmentDraft, RequestDraft, TransferTransitionOptions } from '../contracts';
import { stripNulls } from './normalize';

export { httpAuthService } from './auth';
export { notImplemented, throwNotImplemented } from './notImplemented';

/**
 * HTTP service implementations for every feature domain, calling the Spring
 * Boot API through the configured `apiClient` (`src/services/api/client.ts`)
 * with relative `/v1/...` paths against `VITE_API_BASE_URL`.
 *
 * Conventions matched against the actual backend:
 * - List endpoints return plain JSON arrays (no pagination envelope).
 * - Backend errors arrive as `{ code, message, details? }` and are already
 *   normalized into `ServiceError`s (VALIDATION / NOT_FOUND / UNAUTHORIZED /
 *   CONFLICT / NETWORK …) by the axios response interceptor, so methods only
 *   unwrap `data`.
 * - Optional record fields serialized as `null` are stripped so responses
 *   match the optional-property frontend types.
 * - Mutations return `Promise<void>` per contract; the server's created or
 *   updated record is authoritative for the next list read (the workspace
 *   layer refetches after mutations).
 */

/** Path segment guard for ids interpolated into URLs. */
function enc(id: string): string {
  return encodeURIComponent(id);
}

export function createHttpServices(): Omit<AppServices, 'auth'> {
  return {
    hospitals: {
      listHospitals: async () =>
        stripNulls((await apiClient.get<Hospital[]>('/v1/hospitals')).data),

      // 404 from the backend normalizes to a NOT_FOUND ServiceError.
      getHospital: async (id) =>
        stripNulls((await apiClient.get<Hospital>(`/v1/hospitals/${enc(id)}`)).data),
    },

    equipment: {
      listEquipment: async () =>
        stripNulls((await apiClient.get<MedicalEquipment[]>('/v1/equipment')).data),

      getEquipment: async (id) =>
        stripNulls((await apiClient.get<MedicalEquipment>(`/v1/equipment/${enc(id)}`)).data),

      // The frontend `EquipmentDraft` mirrors the backend request record
      // exactly (ids/updatedAt are server-assigned); undefined optional
      // fields are dropped by JSON serialization and read back as absent.
      createEquipment: async (draft: EquipmentDraft) => {
        await apiClient.post('/v1/equipment', draft);
      },

      updateEquipment: async (id, draft: EquipmentDraft) => {
        await apiClient.patch(`/v1/equipment/${enc(id)}`, draft);
      },

      // Enforcement lives here: the backend answers 409 CONFLICT with the
      // blocking reason when the listing is referenced by open requests or
      // active transfers.
      deleteEquipment: async (id) => {
        await apiClient.delete(`/v1/equipment/${enc(id)}`);
      },

      // No dedicated blocker endpoint exists; recompute the same pre-flight
      // explanation the mock derives, using fresh server data.
      getDeleteBlocker: async (id) => {
        const [, requests, transfers] = await Promise.all([
          apiClient.get<MedicalEquipment>(`/v1/equipment/${enc(id)}`),
          apiClient.get<EquipmentRequest[]>('/v1/requests'),
          apiClient.get<EquipmentTransfer[]>('/v1/transfers'),
        ]);
        return equipmentDeleteBlocker(
          partialRuleState({ requests: stripNulls(requests.data), transfers: stripNulls(transfers.data) }),
          id,
        );
      },
    },

    requests: {
      listRequests: async () =>
        stripNulls((await apiClient.get<EquipmentRequest[]>('/v1/requests')).data),

      getRequest: async (id) =>
        stripNulls((await apiClient.get<EquipmentRequest>(`/v1/requests/${enc(id)}`)).data),

      // The frontend `RequestDraft` mirrors the backend body; status, ids,
      // timestamps, history and equipmentName are assigned by the server.
      createRequest: async (draft: RequestDraft) => {
        await apiClient.post('/v1/requests', draft);
      },

      // Approve takes an optional note the contract does not carry, so the
      // body is omitted; a non-Pending request or lost availability surfaces
      // as 409 CONFLICT with the server's reason.
      approveRequest: async (id) => {
        await apiClient.post(`/v1/requests/${enc(id)}/approve`);
      },

      rejectRequest: async (id, reason) => {
        await apiClient.post(`/v1/requests/${enc(id)}/reject`, { reason });
      },

      cancelRequest: async (id) => {
        await apiClient.post(`/v1/requests/${enc(id)}/cancel`);
      },

      // Same approach as `getDeleteBlocker`: no blocker endpoint exists, so
      // the pre-flight explanation is computed from fresh server data.
      getApprovalBlocker: async (id) => {
        const [requests, equipment] = await Promise.all([
          apiClient.get<EquipmentRequest[]>('/v1/requests'),
          apiClient.get<MedicalEquipment[]>('/v1/equipment'),
        ]);
        return requestApprovalBlocker(
          partialRuleState({
            requests: stripNulls(requests.data),
            equipment: stripNulls(equipment.data),
          }),
          id,
        );
      },
    },

    transfers: {
      listTransfers: async () =>
        stripNulls((await apiClient.get<EquipmentTransfer[]>('/v1/transfers')).data),

      getTransfer: async (id) =>
        stripNulls((await apiClient.get<EquipmentTransfer>(`/v1/transfers/${enc(id)}`)).data),

      // A transfer is prepared solely from an approved request id; preparing
      // one for a non-Approved (or already-transferred) request is 409.
      createTransfer: async (requestId) => {
        await apiClient.post('/v1/transfers', { requestId });
      },

      // Compatibility route for the generic contract method — the backend
      // funnels it through the same validated lifecycle transition as the
      // dedicated /dispatch, /receive and /return action routes. Illegal
      // moves come back as 409 CONFLICT. Note: the backend does not enforce
      // sender/receiver actor checks yet (no auth), so gating shown in the
      // UI comes from the frontend rules, not from server 403s.
      updateTransferStatus: async (id, status: TransferStatus, note?: string) => {
        await apiClient.post(`/v1/transfers/${enc(id)}/status`, note === undefined ? { status } : { status, note });
      },

      // The backend splits valid next statuses exactly like the contract:
      // `available` vs `counterpartOwned` for the store's acting institution.
      getTransitionOptions: async (id) =>
        stripNulls(
          (await apiClient.get<TransferTransitionOptions>(`/v1/transfers/${enc(id)}/transition-options`)).data,
        ),
    },

    activity: {
      listActivities: async () =>
        stripNulls((await apiClient.get<Activity[]>('/v1/activities')).data),
    },

    settings: {
      getSettings: async () =>
        stripNulls((await apiClient.get<UserSettings>('/v1/settings')).data),

      // Sections are merged server-side; every field of the frontend
      // `Partial<UserSettings>` patch maps 1:1 onto the backend
      // `SettingsPatchBody` (user.role is server-managed and ignored there).
      updateSettings: async (patch: Partial<UserSettings>) => {
        await apiClient.patch('/v1/settings', patch);
      },
    },
  };
}

/**
 * The blocker rules are pure functions that only read the collections they
 * are given (`requests`, `transfers`, `equipment`), so a partial snapshot of
 * fresh server data is sufficient — cast keeps the shared rule signatures.
 */
function partialRuleState(partial: {
  requests?: WorkspaceState['requests'];
  transfers?: WorkspaceState['transfers'];
  equipment?: WorkspaceState['equipment'];
}): WorkspaceState {
  return partial as WorkspaceState;
}
