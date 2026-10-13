import type { EquipmentRequest } from '@/types';

/**
 * Create payload for a borrow request. Status, ids, timestamps and the
 * denormalized equipment name are assigned by the data source.
 */
export type RequestDraft = Omit<
  EquipmentRequest,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'history' | 'equipmentName'
>;

/**
 * Equipment request contract (approval workflow).
 *
 * Workflow invariants enforced by every implementation:
 * - a request must be Pending to be approved, rejected or cancelled;
 * - approval reserves units and fails with CONFLICT when availability
 *   changed in the meantime;
 * - approval does not dispatch — dispatching happens via `TransferService`.
 */
export interface RequestService {
  listRequests: () => Promise<EquipmentRequest[]>;
  /** Resolves the request or throws NOT_FOUND. */
  getRequest: (id: string) => Promise<EquipmentRequest>;
  /** Throws CONFLICT when the requested quantity is no longer available. */
  createRequest: (draft: RequestDraft) => Promise<void>;
  /** Throws CONFLICT with the availability/status reason when approval is not possible. */
  approveRequest: (id: string) => Promise<void>;
  /** Requires a non-empty reason; throws CONFLICT when the request is not Pending. */
  rejectRequest: (id: string, reason: string) => Promise<void>;
  /** Requester-side cancellation; throws CONFLICT when the request is not Pending. */
  cancelRequest: (id: string) => Promise<void>;
  /** Pre-flight explanation used by the UI; null when approval is currently allowed. */
  getApprovalBlocker: (id: string) => Promise<string | null>;
}
