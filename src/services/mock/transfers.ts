import {
  institutionNameById,
  nextTransferStatuses,
  transferTransitionOptions,
} from '@/features/workspace/rules';
import type { EquipmentTransfer } from '@/types';
import { ServiceError } from '../errors';
import type { TransferService } from '../contracts/transfers';
import type { WorkspaceAccess } from './access';
import { delay } from './delay';

function findTransfer(access: WorkspaceAccess, id: string): EquipmentTransfer {
  const found = access.getState().transfers.find((t) => t.id === id);
  if (!found) {
    throw new ServiceError('NOT_FOUND', `Transfer ${id} no longer exists.`, { status: 404 });
  }
  return found;
}

/** Mock transfer service backed by the centralized workspace store. */
export function createMockTransferService(access: WorkspaceAccess): TransferService {
  return {
    async listTransfers() {
      await delay();
      return [...access.getState().transfers];
    },

    async getTransfer(id) {
      await delay();
      return findTransfer(access, id);
    },

    async createTransfer(requestId) {
      const state = access.getState();
      const request = state.requests.find((r) => r.id === requestId);
      if (!request) {
        throw new ServiceError('NOT_FOUND', `Request ${requestId} no longer exists.`, {
          status: 404,
        });
      }
      // Workflow constraint: requests require approval before dispatch.
      if (request.status !== 'Approved') {
        throw new ServiceError(
          'CONFLICT',
          `Only Approved requests can be prepared for dispatch (this one is ${request.status.toLowerCase()}).`,
          { status: 409 },
        );
      }
      if (state.transfers.some((t) => t.requestId === requestId)) {
        throw new ServiceError('CONFLICT', 'A transfer has already been prepared for this request.', {
          status: 409,
        });
      }
      await delay();
      access.createTransfer(requestId);
    },

    async updateTransferStatus(id, status, note) {
      const state = access.getState();
      const transfer = findTransfer(access, id);
      if (!nextTransferStatuses(transfer.status).includes(status)) {
        throw new ServiceError(
          'CONFLICT',
          `${status} is not a valid next step for ${transfer.id} (currently ${transfer.status}).`,
          { status: 409 },
        );
      }
      const { available, counterpartOwned } = transferTransitionOptions(
        transfer,
        state.currentInstitutionId,
      );
      if (!available.includes(status)) {
        if (counterpartOwned.includes(status)) {
          const counterpartId =
            state.currentInstitutionId === transfer.sendingInstitutionId
              ? transfer.receivingInstitutionId
              : transfer.sendingInstitutionId;
          throw new ServiceError(
            'FORBIDDEN',
            `${status} is recorded by ${institutionNameById(state, counterpartId)}, not by your institution.`,
            { status: 403 },
          );
        }
        throw new ServiceError('FORBIDDEN', 'Your institution cannot record this step.', {
          status: 403,
        });
      }
      await delay();
      access.advanceTransfer(id, status, note);
    },

    async getTransitionOptions(id) {
      const state = access.getState();
      const transfer = findTransfer(access, id);
      await delay();
      return transferTransitionOptions(transfer, state.currentInstitutionId);
    },
  };
}
