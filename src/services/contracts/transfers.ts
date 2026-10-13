import type { EquipmentTransfer, TransferStatus } from '@/types';

/** Valid next transfer states for the acting institution vs. its counterpart. */
export interface TransferTransitionOptions {
  /** Transitions the acting institution is allowed to record right now. */
  available: TransferStatus[];
  /** Valid next states managed by the counterpart institution. */
  counterpartOwned: TransferStatus[];
}

/**
 * Equipment transfer contract (physical movement workflow).
 *
 * Movement invariants enforced by every implementation:
 * - transfers can only be prepared from Approved requests (approval ≠ dispatch);
 * - only the transitions of the valid flow that belong to the acting side may
 *   be recorded (receipt is recorded by the receiver, dispatch by the sender);
 * - availability is released only on `Completed` (receipt ≠ return).
 */
export interface TransferService {
  listTransfers: () => Promise<EquipmentTransfer[]>;
  /** Resolves the transfer or throws NOT_FOUND. */
  getTransfer: (id: string) => Promise<EquipmentTransfer>;
  /** Prepares a transfer from an approved request. Throws CONFLICT otherwise. */
  createTransfer: (requestId: string) => Promise<void>;
  /** Moves a transfer to a valid next status. Throws CONFLICT / FORBIDDEN otherwise. */
  updateTransferStatus: (id: string, status: TransferStatus, note?: string) => Promise<void>;
  /** Which transitions the acting institution may record for a transfer. */
  getTransitionOptions: (id: string) => Promise<TransferTransitionOptions>;
}
