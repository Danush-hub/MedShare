import { equipmentDeleteBlocker } from '@/features/workspace/rules';
import type { MedicalEquipment } from '@/types';
import { ServiceError } from '../errors';
import type { EquipmentDraft, EquipmentService } from '../contracts/equipment';
import type { WorkspaceAccess } from './access';
import { delay } from './delay';

/** Draft-shape validation shared by create and update. */
function validateDraft(draft: EquipmentDraft): void {
  const details: Record<string, string[]> = {};
  if (!draft.name.trim()) details.name = ['Equipment name is required.'];
  if (!draft.city.trim()) details.city = ['Location (city) is required.'];
  if (!Number.isInteger(draft.quantity) || draft.quantity < 1) {
    details.quantity = ['Total quantity must be at least 1.'];
  }
  if (!Number.isInteger(draft.availableQuantity) || draft.availableQuantity < 0) {
    details.availableQuantity = ['Available quantity cannot be negative.'];
  } else if (draft.availableQuantity > draft.quantity) {
    details.availableQuantity = ['Available quantity cannot exceed the total quantity.'];
  }
  if (draft.availableFrom && draft.availableUntil && draft.availableFrom > draft.availableUntil) {
    details.availableFrom = ['"Available from" must be before "available until".'];
  }
  if (Object.keys(details).length > 0) {
    throw new ServiceError('VALIDATION', 'Please fix the highlighted fields before saving.', {
      details,
    });
  }
}

function findEquipment(access: WorkspaceAccess, id: string): MedicalEquipment {
  const found = access.getState().equipment.find((e) => e.id === id);
  if (!found) {
    throw new ServiceError('NOT_FOUND', `Equipment listing ${id} no longer exists.`, {
      status: 404,
    });
  }
  return found;
}

/** Mock equipment service backed by the centralized workspace store. */
export function createMockEquipmentService(access: WorkspaceAccess): EquipmentService {
  return {
    async listEquipment() {
      await delay();
      return [...access.getState().equipment];
    },

    async getEquipment(id) {
      await delay();
      return findEquipment(access, id);
    },

    async createEquipment(draft) {
      validateDraft(draft);
      await delay();
      access.addEquipment(draft);
    },

    async updateEquipment(id, draft) {
      findEquipment(access, id);
      validateDraft(draft);
      await delay();
      access.updateEquipment(id, draft);
    },

    async deleteEquipment(id) {
      findEquipment(access, id);
      const blocker = equipmentDeleteBlocker(access.getState(), id);
      if (blocker) {
        throw new ServiceError('CONFLICT', blocker, { status: 409 });
      }
      await delay();
      access.deleteEquipment(id);
    },

    async getDeleteBlocker(id) {
      findEquipment(access, id);
      await delay();
      return equipmentDeleteBlocker(access.getState(), id);
    },
  };
}
