import { requestApprovalBlocker, requestAvailabilityBlocker } from '@/features/workspace/rules';
import type { EquipmentRequest } from '@/types';
import { ServiceError } from '../errors';
import type { RequestService } from '../contracts/requests';
import type { WorkspaceAccess } from './access';
import { delay } from './delay';

function findRequest(access: WorkspaceAccess, id: string): EquipmentRequest {
  const found = access.getState().requests.find((r) => r.id === id);
  if (!found) {
    throw new ServiceError('NOT_FOUND', `Request ${id} no longer exists.`, { status: 404 });
  }
  return found;
}

/** Mock request service backed by the centralized workspace store. */
export function createMockRequestService(access: WorkspaceAccess): RequestService {
  return {
    async listRequests() {
      await delay();
      return [...access.getState().requests];
    },

    async getRequest(id) {
      await delay();
      return findRequest(access, id);
    },

    async createRequest(draft) {
      if (!Number.isInteger(draft.quantity) || draft.quantity < 1) {
        throw new ServiceError('VALIDATION', 'Request at least one unit.', {
          details: { quantity: ['Quantity must be 1 or more.'] },
        });
      }
      if (!draft.purpose.trim()) {
        throw new ServiceError('VALIDATION', 'A purpose for the request is required.', {
          details: { purpose: ['Purpose is required.'] },
        });
      }
      const state = access.getState();
      const equipment = state.equipment.find((e) => e.id === draft.equipmentId);
      if (!equipment) {
        throw new ServiceError('NOT_FOUND', 'The selected equipment listing no longer exists.', {
          status: 404,
        });
      }
      // Equipment under maintenance or retired cannot be borrowed.
      const availabilityBlocker = requestAvailabilityBlocker(equipment);
      if (availabilityBlocker) {
        throw new ServiceError('CONFLICT', availabilityBlocker, { status: 409 });
      }
      // Availability can change while a request form is open — re-check live.
      if (draft.quantity > equipment.availableQuantity) {
        throw new ServiceError(
          'CONFLICT',
          `Availability changed while the request was being prepared: only ${equipment.availableQuantity} unit(s) of ${equipment.name} remain unreserved.`,
          { status: 409 },
        );
      }
      await delay();
      access.createRequest(draft);
    },

    async approveRequest(id) {
      findRequest(access, id);
      const blocker = requestApprovalBlocker(access.getState(), id);
      if (blocker) {
        throw new ServiceError('CONFLICT', blocker, { status: 409 });
      }
      await delay();
      access.approveRequest(id);
    },

    async rejectRequest(id, reason) {
      const request = findRequest(access, id);
      if (!reason.trim()) {
        throw new ServiceError('VALIDATION', 'A rejection reason is required.', {
          details: { reason: ['Reason is required.'] },
        });
      }
      if (request.status !== 'Pending') {
        throw new ServiceError(
          'CONFLICT',
          `Only Pending requests can be rejected (this one is ${request.status.toLowerCase()}).`,
          { status: 409 },
        );
      }
      await delay();
      access.rejectRequest(id, reason.trim());
    },

    async cancelRequest(id) {
      const request = findRequest(access, id);
      if (request.status !== 'Pending') {
        throw new ServiceError(
          'CONFLICT',
          `Only Pending requests can be cancelled (this one is ${request.status.toLowerCase()}).`,
          { status: 409 },
        );
      }
      await delay();
      access.cancelRequest(id);
    },

    async getApprovalBlocker(id) {
      await delay();
      return requestApprovalBlocker(access.getState(), id);
    },
  };
}
