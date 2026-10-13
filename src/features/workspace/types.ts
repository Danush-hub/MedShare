/**
 * Workspace view model for the authenticated MedShare prototype.
 *
 * The canonical records live in `src/types/domain.ts` (Hospital,
 * MedicalEquipment, EquipmentRequest, EquipmentTransfer, Activity,
 * UserSettings). This module keeps the short aliases the UI already uses,
 * adds the option-list constants used by filters and badges, and defines the
 * centralized `WorkspaceState` aggregate owned by the mock store.
 */

import type {
  Activity,
  EquipmentAvailability,
  EquipmentCategory,
  EquipmentCondition,
  EquipmentRequest,
  EquipmentTransfer,
  Hospital,
  MedicalEquipment,
  RequestStatus,
  TransferStatus,
  UserSettings,
} from '@/types/domain';
import type { DemoRoleId } from './permissions';

export type {
  Activity,
  ActivityType,
  EquipmentAvailability,
  EquipmentCategory,
  EquipmentCondition,
  EquipmentRequest,
  EquipmentTransfer,
  Hospital,
  InstitutionStatus,
  InstitutionType,
  MedicalEquipment,
  RequestStatus,
  StatusEvent,
  TransferStatus,
  User,
  UserRole,
  UserSettings,
} from '@/types/domain';

/** Legacy aliases kept so existing feature imports stay stable. */
export type Institution = Hospital;
export type EquipmentItem = MedicalEquipment;
export type ShareRequest = EquipmentRequest;
export type Transfer = EquipmentTransfer;
export type ActivityEntry = Activity;
export type WorkspaceSettings = UserSettings;

/** The complete, centralized workspace dataset (mock store shape). */
export interface WorkspaceState {
  /** The institution the signed-in administrator operates for. */
  currentInstitutionId: string;
  /**
   * The demo role currently being previewed (drives the permission model).
   * Independent of the `admin` / `1234` login — see `./permissions`.
   */
  demoRole: DemoRoleId;
  institutions: Hospital[];
  equipment: MedicalEquipment[];
  requests: EquipmentRequest[];
  transfers: EquipmentTransfer[];
  activities: Activity[];
  settings: UserSettings;
}

// --- Option lists for filters, forms and badges ------------------------------

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  'Patient Monitoring',
  'Respiratory Support',
  'Diagnostic Equipment',
  'Emergency Equipment',
  'Mobility & Patient Care',
  'Surgical Support',
];

export const EQUIPMENT_AVAILABILITIES: EquipmentAvailability[] = [
  'Available',
  'Partially Available',
  'Reserved',
  'Unavailable',
  'Under Maintenance',
  'Retired',
];

export const EQUIPMENT_CONDITIONS: EquipmentCondition[] = [
  'Excellent',
  'Good',
  'Maintenance Required',
];

export const REQUEST_STATUSES: RequestStatus[] = [
  'Pending',
  'Approved',
  'Rejected',
  'Cancelled',
  'Dispatched',
  'Received',
  'Returned',
  'Completed',
];

export const TRANSFER_STATUSES: TransferStatus[] = [
  'Awaiting Dispatch',
  'Dispatched',
  'In Transit',
  'Received',
  'Return Scheduled',
  'Returned',
  'Completed',
];
