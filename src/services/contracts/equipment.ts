import type { MedicalEquipment } from '@/types';

/**
 * Create/update payload for an equipment listing. Ids and timestamps are
 * assigned by the data source (mock store today, backend later).
 */
export type EquipmentDraft = Omit<MedicalEquipment, 'id' | 'updatedAt'>;

/**
 * Equipment feature contract. `Promise` results mirror the future REST calls;
 * the mock implementation resolves against the centralized workspace store.
 * Mutations enforce business rules and throw `ServiceError` with a user-safe
 * message (VALIDATION / NOT_FOUND / CONFLICT) instead of silently no-oping.
 *
 * `getDeleteBlocker` is a pre-flight explanation used by the UI so the reason
 * can be shown before a destructive confirmation; `deleteEquipment` enforces
 * the same rule and remains the authoritative check.
 */
export interface EquipmentService {
  listEquipment: () => Promise<MedicalEquipment[]>;
  /** Resolves the listing or throws NOT_FOUND. */
  getEquipment: (id: string) => Promise<MedicalEquipment>;
  createEquipment: (draft: EquipmentDraft) => Promise<void>;
  updateEquipment: (id: string, draft: EquipmentDraft) => Promise<void>;
  /** Throws CONFLICT when the listing is referenced by open requests or active transfers. */
  deleteEquipment: (id: string) => Promise<void>;
  /** Human-readable reason deletion is currently blocked, or null when allowed. */
  getDeleteBlocker: (id: string) => Promise<string | null>;
}
