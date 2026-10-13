/**
 * Canonical, shared domain model for MedShare.
 *
 * These interfaces are the single source of truth for the application data.
 * They mirror the JSON shapes proposed in `docs/API_CONTRACT.md`, so a future
 * Spring Boot backend can be adopted without reshaping the UI. The mock layer
 * (the `localStorage`-persisted workspace store) stores exactly these records, and every
 * service contract in `src/services/contracts` is typed against them.
 *
 * No clinical certification fields or regulatory claims are modelled here.
 */

// --- Users & authentication --------------------------------------------------

/** Roles a MedShare account can hold. Mirrors the future backend enum. */
export type UserRole = 'ADMIN' | 'COORDINATOR' | 'CLINICIAN' | 'LOGISTICS';

/** A person operating MedShare. Prototype demo sessions use this shape. */
export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  /** Optional e-mail; not collected by the demo login. */
  email?: string;
  /** Institution the user operates for (backend-provided when it exists). */
  institutionId?: string;
}

// --- Hospitals (institutions) ------------------------------------------------

export type InstitutionType = 'Hospital' | 'Clinic' | 'Medical Center' | 'Community Health Center';

export type InstitutionStatus = 'Active' | 'Pending Verification' | 'Suspended';

/** A partner healthcare institution in the sharing network. */
export interface Hospital {
  id: string;
  name: string;
  type: InstitutionType;
  city: string;
  region: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: InstitutionStatus;
  /** ISO-8601 timestamp of when the institution joined the network. */
  joinedAt: string;
}

// --- Equipment ----------------------------------------------------------------

export type EquipmentCategory =
  | 'Patient Monitoring'
  | 'Respiratory Support'
  | 'Diagnostic Equipment'
  | 'Emergency Equipment'
  | 'Mobility & Patient Care'
  | 'Surgical Support';

export type EquipmentAvailability =
  | 'Available'
  | 'Partially Available'
  | 'Reserved'
  | 'Unavailable'
  /** Manual flag: units are being serviced/calibrated and must not be requested. */
  | 'Under Maintenance'
  /** Manual flag: unit is decommissioned and permanently out of the sharing pool. */
  | 'Retired';

export type EquipmentCondition = 'Excellent' | 'Good' | 'Maintenance Required';

/** A listed, shareable equipment line owned by an institution. */
export interface MedicalEquipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  /** Owning institution id. */
  institutionId: string;
  /** Optional human reference / asset tag entered by the institution. */
  internalReference?: string;
  quantity: number;
  /** Units currently free to be shared (<= quantity). */
  availableQuantity: number;
  city: string;
  condition: EquipmentCondition;
  availability: EquipmentAvailability;
  description?: string;
  maintenanceNotes?: string;
  availableFrom?: string;
  availableUntil?: string;
  /** Whether supporting documentation is on file (indicator only). */
  documentationOnFile: boolean;
  /** ISO-8601 timestamp of the last modification. */
  updatedAt: string;
}

// --- Requests -----------------------------------------------------------------

/** Approval-workflow state of a borrow request (distinct from transfer state). */
export type RequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Dispatched'
  | 'Received'
  | 'Returned'
  | 'Completed';

/** A timestamped status change recorded on a request or transfer. */
export interface StatusEvent<TStatus extends string> {
  status: TStatus;
  /** ISO-8601 timestamp of when the status was recorded. */
  at: string;
  note?: string;
}

/** A borrow request between two institutions. */
export interface EquipmentRequest {
  id: string;
  equipmentId: string;
  /** Denormalized for display; the backend would resolve it via equipmentId. */
  equipmentName: string;
  requestingInstitutionId: string;
  supplyingInstitutionId: string;
  quantity: number;
  purpose: string;
  /** ISO date (yyyy-mm-dd) the request was raised. */
  requestedDate: string;
  /** ISO date the equipment is needed by. */
  requiredDate: string;
  /** ISO date the equipment is expected back. */
  expectedReturnDate: string;
  deliveryLocation: string;
  notes?: string;
  status: RequestStatus;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  history: StatusEvent<RequestStatus>[];
}

// --- Transfers ----------------------------------------------------------------

/** Physical-movement state of an approved request (distinct from request state). */
export type TransferStatus =
  | 'Awaiting Dispatch'
  | 'Dispatched'
  | 'In Transit'
  | 'Received'
  | 'Return Scheduled'
  | 'Returned'
  | 'Completed';

/** Physical movement of an approved request between institutions. */
export interface EquipmentTransfer {
  id: string;
  requestId: string;
  equipmentId: string;
  equipmentName: string;
  sendingInstitutionId: string;
  receivingInstitutionId: string;
  quantity: number;
  /** ISO date the units left the sending institution. */
  dispatchDate?: string;
  /** ISO date the units are expected back. */
  expectedReturn?: string;
  handoverNotes?: string;
  status: TransferStatus;
  createdAt: string;
  updatedAt: string;
  timeline: StatusEvent<TransferStatus>[];
}

// --- Activity -----------------------------------------------------------------

/** Kinds of notable actions recorded in the activity history. */
export type ActivityType =
  | 'equipment_created'
  | 'equipment_updated'
  | 'equipment_deleted'
  | 'request_submitted'
  | 'request_approved'
  | 'request_rejected'
  | 'request_cancelled'
  | 'transfer_created'
  | 'transfer_updated'
  | 'settings_updated';

/** A chronological record of an important workflow action. */
export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  /** Id of the record this entry relates to (EQ-/REQ-/TRF-/SETTINGS). */
  relatedId?: string;
  /** Status vocabulary of the related record at the time of the entry. */
  status?: string;
  /** ISO-8601 timestamp of when the action happened. */
  at: string;
}

// --- Settings -----------------------------------------------------------------

/** Institution, account and notification settings for the workspace. */
export interface UserSettings {
  institution: {
    name: string;
    type: InstitutionType;
    city: string;
    contactPerson: string;
    workEmail: string;
  };
  user: {
    displayName: string;
    username: string;
    role: string;
  };
  preferences: {
    emailOnNewRequest: boolean;
    emailOnRequestDecision: boolean;
    emailOnTransferUpdate: boolean;
    weeklyDigest: boolean;
  };
}
