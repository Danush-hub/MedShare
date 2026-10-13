import type { WorkspaceState } from '@/features/workspace/types';
import type { EquipmentDraft, RequestDraft } from '@/services/contracts';
import type { TransferStatus } from '@/types';

/**
 * The imperative seam between the mock services and the centralized
 * workspace store (`src/features/workspace/store.tsx`).
 *
 * `WorkspaceProvider` satisfies this shape; the services read the live
 * snapshot through `getState()` and apply changes through the action
 * callbacks, so mock mutations flow through exactly the same reducer as the
 * previous direct-store UI and stay mutually consistent (equipment ↔
 * requests ↔ transfers ↔ activity).
 */
export interface WorkspaceAccess {
  /** Live snapshot of the centralized dataset at call time. */
  getState: () => WorkspaceState;
  addEquipment: (draft: EquipmentDraft) => void;
  updateEquipment: (id: string, draft: EquipmentDraft) => void;
  deleteEquipment: (id: string) => void;
  createRequest: (draft: RequestDraft) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string, reason: string) => void;
  cancelRequest: (id: string) => void;
  createTransfer: (requestId: string) => void;
  advanceTransfer: (id: string, status: TransferStatus, note?: string) => void;
  updateSettings: (patch: Partial<WorkspaceState['settings']>) => void;
  resetWorkspace: () => void;
}
