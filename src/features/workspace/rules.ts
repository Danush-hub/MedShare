/**
 * Pure workspace business rules — the workflow engine shared by the mock
 * store reducer and the mock service layer.
 *
 * Keeping these rules outside React components (and outside the reducer
 * itself) means services can validate operations and return meaningful
 * errors, while the UI only presents capabilities and outcomes.
 */

import type {
  EquipmentAvailability,
  EquipmentTransfer,
  MedicalEquipment,
  RequestStatus,
  TransferStatus,
  WorkspaceState,
} from './types';
import type { TransferTransitionOptions } from '@/services/contracts/transfers';

export type { TransferTransitionOptions };

/** Valid next-status transitions for the physical transfer workflow. */
export const TRANSFER_FLOW: Record<TransferStatus, TransferStatus[]> = {
  'Awaiting Dispatch': ['Dispatched'],
  Dispatched: ['In Transit', 'Received'],
  'In Transit': ['Received'],
  Received: ['Return Scheduled', 'Completed'],
  'Return Scheduled': ['Returned'],
  Returned: ['Completed'],
  Completed: [],
};

/** Which side of a transfer owns each status transition. */
export const TRANSFER_ACTOR: Record<TransferStatus, 'sending' | 'receiving'> = {
  'Awaiting Dispatch': 'sending',
  Dispatched: 'sending',
  'In Transit': 'sending',
  Received: 'receiving',
  'Return Scheduled': 'receiving',
  Returned: 'sending',
  Completed: 'sending',
};

/** Valid next transfer states for a given status (drives the UI action menu). */
export function nextTransferStatuses(status: TransferStatus): TransferStatus[] {
  return TRANSFER_FLOW[status] ?? [];
}

/**
 * Split the valid next transfer statuses by who owns them, so each institution
 * only sees transitions it is actually responsible for (e.g. only the receiver
 * can confirm `Received`).
 */
export function transferTransitionOptions(
  transfer: EquipmentTransfer,
  actorInstitutionId: string,
): TransferTransitionOptions {
  const next = nextTransferStatuses(transfer.status);
  if (
    actorInstitutionId !== transfer.sendingInstitutionId &&
    actorInstitutionId !== transfer.receivingInstitutionId
  ) {
    return { available: [], counterpartOwned: next };
  }
  const isSender = actorInstitutionId === transfer.sendingInstitutionId;
  const available = next.filter((status) => {
    const actor = TRANSFER_ACTOR[status];
    return isSender ? actor === 'sending' : actor === 'receiving';
  });
  return { available, counterpartOwned: next.filter((status) => !available.includes(status)) };
}

/** Institution name for a display fallback, or 'Unknown institution'. */
export function institutionNameById(state: WorkspaceState, id: string): string {
  return state.institutions.find((i) => i.id === id)?.name ?? 'Unknown institution';
}

/**
 * Recompute the availability label from the live unit counts. Manually flagged
 * lifecycle states (`Unavailable`, `Under Maintenance`, `Retired`) are business
 * decisions, not a function of unit counts, so workflow side effects never
 * auto-reopen them.
 */
const MANUAL_AVAILABILITY: EquipmentAvailability[] = ['Unavailable', 'Under Maintenance', 'Retired'];

export function recalcAvailability(
  current: EquipmentAvailability,
  availableQuantity: number,
  total: number,
): EquipmentAvailability {
  if (MANUAL_AVAILABILITY.includes(current)) return current;
  if (availableQuantity <= 0) return 'Reserved';
  if (availableQuantity >= total) return 'Available';
  return 'Partially Available';
}

/**
 * Availability states that must not accept new borrow requests. `Reserved` is
 * intentionally excluded: it simply means every unit is currently committed and
 * can accept a request once one is released.
 */
const NON_REQUESTABLE_AVAILABILITY: EquipmentAvailability[] = [
  'Unavailable',
  'Under Maintenance',
  'Retired',
];

/** Whether a listing is in a state that can accept a borrow request. */
export function isRequestableAvailability(availability: EquipmentAvailability): boolean {
  return !NON_REQUESTABLE_AVAILABILITY.includes(availability);
}

/** Human-readable reason a listing cannot be requested, or `null` when it can. */
export function requestAvailabilityBlocker(equipment: MedicalEquipment): string | null {
  switch (equipment.availability) {
    case 'Under Maintenance':
      return `${equipment.name} is flagged Under Maintenance and cannot be requested until servicing is complete.`;
    case 'Retired':
      return `${equipment.name} has been Retired and is no longer available to share.`;
    case 'Unavailable':
      return `${equipment.name} has been flagged Unavailable by its owner.`;
    default:
      return null;
    }
}

/**
 * Why a request cannot currently be approved, or `null` when approval is
 * allowed. Approval reserves units, so the live availability is re-checked
 * against the requested quantity at decision time.
 */
export function requestApprovalBlocker(state: WorkspaceState, requestId: string): string | null {
  const request = state.requests.find((r) => r.id === requestId);
  if (!request) return 'This request no longer exists.';
  if (request.status !== 'Pending') {
    return `Only Pending requests can be approved (this one is ${request.status.toLowerCase()}).`;
  }
  const equipment = state.equipment.find((e) => e.id === request.equipmentId);
  if (!equipment) {
    return 'The linked equipment listing no longer exists in the inventory.';
  }
  const availabilityBlocker = requestAvailabilityBlocker(equipment);
  if (availabilityBlocker) {
    return availabilityBlocker;
  }
  if (equipment.availableQuantity < request.quantity) {
    return `Availability has changed since this request was submitted: only ${equipment.availableQuantity} of the ${request.quantity} requested unit(s) of ${equipment.name} remain unreserved.`;
  }
  return null;
}

/**
 * Why an equipment listing cannot be deleted, or `null` when deletion is
 * allowed. Records tied to live workflow state must stay consistent.
 */
export function equipmentDeleteBlocker(state: WorkspaceState, equipmentId: string): string | null {
  const activeTransfer = state.transfers.find(
    (t) => t.equipmentId === equipmentId && t.status !== 'Completed',
  );
  if (activeTransfer) {
    return `This listing is part of an active transfer (${activeTransfer.id} — ${activeTransfer.status}). Complete the transfer before removing it.`;
  }
  const openRequest = state.requests.find(
    (r) => r.equipmentId === equipmentId && OPEN_REQUEST_STATUSES.includes(r.status),
  );
  if (openRequest) {
    return `This listing has an open request (${openRequest.id} — ${openRequest.status}). Resolve the request before removing it.`;
  }
  return null;
}

/** Request statuses that still count as "open" for consistency checks. */
export const OPEN_REQUEST_STATUSES: RequestStatus[] = [
  'Pending',
  'Approved',
  'Dispatched',
  'Received',
];
