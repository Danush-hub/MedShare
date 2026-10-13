import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { createSeedState } from './seed';
import {
  equipmentDeleteBlocker,
  recalcAvailability,
  TRANSFER_ACTOR,
  TRANSFER_FLOW,
} from './rules';
import {
  type Activity,
  type EquipmentTransfer,
  type MedicalEquipment,
  type EquipmentRequest,
  type TransferStatus,
  type UserSettings,
  type WorkspaceState,
} from './types';
import type { EquipmentDraft, RequestDraft } from '@/services/contracts';
import { makeReadableId, nextSequence } from '@/lib/format';
import { DEMO_ROLES, type DemoRoleId } from './permissions';

/**
 * Single, versioned persistence key for the workspace snapshot.
 *
 * State is stored in `localStorage` (was `sessionStorage` before Prompt 9) so
 * demo changes survive browser and tab restarts. The same `medshare.workspace.v1`
 * key/shape is reused; the previous session-scoped value is migrated once (see
 * `loadInitialState`). Browser storage is user-controlled and local to this
 * device only — it is not server-side durability or shared multi-user storage,
 * and must never hold patient, confidential or credential data.
 */
const STORAGE_KEY = 'medshare.workspace.v1';

/**
 * The centralized mock store is the persistence engine behind the mock
 * service implementations (`src/services/mock`). Business rules that must be
 * evaluated before a mutation live in `./rules` and are enforced by the mock
 * services; the reducer keeps the same guards as a defensive safety net so
 * state can never transition illegally, even if an action slips through.
 */

// Re-exported so existing feature imports keep working; the canonical
// definitions live in `@/services/contracts`.
export type { EquipmentDraft, RequestDraft };

// --- Actions ---------------------------------------------------------------

export type WorkspaceAction =
  | { type: 'equipment/add'; draft: EquipmentDraft }
  | { type: 'equipment/update'; id: string; draft: EquipmentDraft }
  | { type: 'equipment/delete'; id: string }
  | { type: 'request/create'; draft: RequestDraft }
  | { type: 'request/approve'; id: string }
  | { type: 'request/reject'; id: string; reason: string }
  | { type: 'request/cancel'; id: string }
  | { type: 'transfer/create'; requestId: string }
  | { type: 'transfer/advance'; id: string; status: TransferStatus; note?: string }
  | { type: 'settings/update'; patch: Partial<UserSettings> }
  | { type: 'role/set'; role: DemoRoleId }
  | { type: 'workspace/reset' };

const YEAR = 2026;

function nowISO(): string {
  return new Date().toISOString();
}

/** Append an activity entry, keeping the list newest-first. */
function withActivity(
  state: WorkspaceState,
  activity: Omit<Activity, 'id' | 'at'>,
): Activity[] {
  const id = makeReadableId(
    'ACT',
    YEAR,
    nextSequence(state.activities.map((a) => a.id), 'ACT', YEAR),
  );
  return [{ ...activity, id, at: nowISO() }, ...state.activities];
}

function reducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'equipment/add': {
      const id = makeReadableId(
        'EQ',
        YEAR,
        nextSequence(state.equipment.map((e) => e.id), 'EQ', YEAR),
      );
      // Keep the availability label consistent with the entered unit counts.
      const normalized = recalcAvailability(
        action.draft.availability,
        action.draft.availableQuantity,
        action.draft.quantity,
      );
      const equipment: MedicalEquipment = {
        ...action.draft,
        availability: normalized,
        id,
        updatedAt: nowISO(),
      };
      return {
        ...state,
        equipment: [equipment, ...state.equipment],
        activities: withActivity(state, {
          type: 'equipment_created',
          description: `Added equipment listing ${equipment.name} (${id}).`,
          relatedId: id,
          status: equipment.availability,
        }),
      };
    }

    case 'equipment/update': {
      const existing = state.equipment.find((e) => e.id === action.id);
      if (!existing) return state;
      const nextAvailable = recalcAvailability(
        action.draft.availability,
        action.draft.availableQuantity,
        action.draft.quantity,
      );
      const updated: MedicalEquipment = {
        ...existing,
        ...action.draft,
        availability: nextAvailable,
        updatedAt: nowISO(),
      };
      return {
        ...state,
        equipment: state.equipment.map((e) => (e.id === action.id ? updated : e)),
        activities: withActivity(state, {
          type: 'equipment_updated',
          description: `Updated equipment listing ${updated.name} (${updated.id}).`,
          relatedId: updated.id,
          status: updated.availability,
        }),
      };
    }

    case 'equipment/delete': {
      const existing = state.equipment.find((e) => e.id === action.id);
      if (!existing) return state;
      // Defensive guard: the mock service surfaces the reason as a CONFLICT.
      if (equipmentDeleteBlocker(state, action.id)) return state;
      return {
        ...state,
        equipment: state.equipment.filter((e) => e.id !== action.id),
        activities: withActivity(state, {
          type: 'equipment_deleted',
          description: `Removed equipment listing ${existing.name} (${existing.id}).`,
          relatedId: existing.id,
        }),
      };
    }

    case 'request/create': {
      const equipment = state.equipment.find((e) => e.id === action.draft.equipmentId);
      const id = makeReadableId(
        'REQ',
        YEAR,
        nextSequence(state.requests.map((r) => r.id), 'REQ', YEAR),
      );
      const at = nowISO();
      const request: EquipmentRequest = {
        ...action.draft,
        id,
        equipmentName: equipment?.name ?? 'Unknown equipment',
        status: 'Pending',
        createdAt: at,
        updatedAt: at,
        history: [{ status: 'Pending', at, note: 'Request submitted.' }],
      };
      return {
        ...state,
        requests: [request, ...state.requests],
        activities: withActivity(state, {
          type: 'request_submitted',
          description: `Submitted request ${id} for ${request.equipmentName}.`,
          relatedId: id,
          status: 'Pending',
        }),
      };
    }

    case 'request/approve': {
      const existing = state.requests.find((r) => r.id === action.id);
      if (!existing || existing.status !== 'Pending') return state;
      const equipment = state.equipment.find((e) => e.id === existing.equipmentId);
      // Availability may have changed since the request was submitted; the
      // mock service surfaces the exact reason as a CONFLICT before dispatch.
      if (!equipment || equipment.availableQuantity < existing.quantity) return state;
      const at = nowISO();
      const updated: EquipmentRequest = {
        ...existing,
        status: 'Approved',
        updatedAt: at,
        history: [
          ...existing.history,
          {
            status: 'Approved',
            at,
            note: `Request approved. ${existing.quantity} unit(s) reserved against ${equipment.id}.`,
          },
        ],
      };
      // Reserve the approved units so later requests/approvals see the change.
      const reservedQuantity = equipment.availableQuantity - existing.quantity;
      const updatedEquipment: MedicalEquipment = {
        ...equipment,
        availableQuantity: reservedQuantity,
        availability: recalcAvailability(
          equipment.availability,
          reservedQuantity,
          equipment.quantity,
        ),
        updatedAt: at,
      };
      return {
        ...state,
        requests: state.requests.map((r) => (r.id === action.id ? updated : r)),
        equipment: state.equipment.map((e) => (e.id === updatedEquipment.id ? updatedEquipment : e)),
        activities: withActivity(state, {
          type: 'request_approved',
          description: `Approved request ${updated.id} for ${updated.equipmentName}. ${existing.quantity} unit(s) reserved.`,
          relatedId: updated.id,
          status: 'Approved',
        }),
      };
    }

    case 'request/reject': {
      const existing = state.requests.find((r) => r.id === action.id);
      if (!existing || existing.status !== 'Pending') return state;
      const at = nowISO();
      const updated: EquipmentRequest = {
        ...existing,
        status: 'Rejected',
        rejectReason: action.reason,
        updatedAt: at,
        history: [...existing.history, { status: 'Rejected', at, note: action.reason }],
      };
      return {
        ...state,
        requests: state.requests.map((r) => (r.id === action.id ? updated : r)),
        activities: withActivity(state, {
          type: 'request_rejected',
          description: `Rejected request ${updated.id} for ${updated.equipmentName}.`,
          relatedId: updated.id,
          status: 'Rejected',
        }),
      };
    }

    case 'request/cancel': {
      const existing = state.requests.find((r) => r.id === action.id);
      if (!existing || existing.status !== 'Pending') return state;
      const at = nowISO();
      const updated: EquipmentRequest = {
        ...existing,
        status: 'Cancelled',
        updatedAt: at,
        history: [...existing.history, { status: 'Cancelled', at, note: 'Cancelled by requester.' }],
      };
      return {
        ...state,
        requests: state.requests.map((r) => (r.id === action.id ? updated : r)),
        activities: withActivity(state, {
          type: 'request_cancelled',
          description: `Cancelled request ${updated.id} for ${updated.equipmentName}.`,
          relatedId: updated.id,
          status: 'Cancelled',
        }),
      };
    }

    case 'transfer/create': {
      const request = state.requests.find((r) => r.id === action.requestId);
      if (!request || request.status !== 'Approved') return state;
      if (state.transfers.some((t) => t.requestId === request.id)) return state;
      const id = makeReadableId(
        'TRF',
        YEAR,
        nextSequence(state.transfers.map((t) => t.id), 'TRF', YEAR),
      );
      const at = nowISO();
      const transfer: EquipmentTransfer = {
        id,
        requestId: request.id,
        equipmentId: request.equipmentId,
        equipmentName: request.equipmentName,
        sendingInstitutionId: request.supplyingInstitutionId,
        receivingInstitutionId: request.requestingInstitutionId,
        quantity: request.quantity,
        expectedReturn: request.expectedReturnDate,
        handoverNotes: 'Prepared from approved request.',
        status: 'Awaiting Dispatch',
        createdAt: at,
        updatedAt: at,
        timeline: [{ status: 'Awaiting Dispatch', at, note: 'Prepared from approved request.' }],
      };
      return {
        ...state,
        transfers: [transfer, ...state.transfers],
        activities: withActivity(state, {
          type: 'transfer_created',
          description: `Prepared transfer ${id} for ${transfer.equipmentName}.`,
          relatedId: id,
          status: 'Awaiting Dispatch',
        }),
      };
    }

    case 'transfer/advance': {
      const existing = state.transfers.find((t) => t.id === action.id);
      if (!existing) return state;
      if (!TRANSFER_FLOW[existing.status].includes(action.status)) return state;
      // Only the owning side of a transition may record it (mock service
      // surfaces this as a FORBIDDEN error before dispatching).
      const owner =
        TRANSFER_ACTOR[action.status] === 'sending'
          ? existing.sendingInstitutionId
          : existing.receivingInstitutionId;
      if (owner !== state.currentInstitutionId) return state;
      const at = nowISO();
      const updated: EquipmentTransfer = {
        ...existing,
        status: action.status,
        dispatchDate:
          action.status === 'Dispatched' && !existing.dispatchDate
            ? at.slice(0, 10)
            : existing.dispatchDate,
        updatedAt: at,
        timeline: [
          ...existing.timeline,
          { status: action.status, at, note: action.note ?? `Marked ${action.status}.` },
        ],
      };

      // Mirror key milestones onto the linked request so both views stay consistent.
      const requestMirror: Record<string, EquipmentRequest['status'] | undefined> = {
        Dispatched: 'Dispatched',
        Received: 'Received',
        Returned: 'Returned',
        Completed: 'Completed',
      };
      const mirroredStatus = requestMirror[action.status];
      const requests = mirroredStatus
        ? state.requests.map((r) =>
            r.id === updated.requestId
              ? {
                  ...r,
                  status: mirroredStatus,
                  updatedAt: at,
                  history: [
                    ...r.history,
                    { status: mirroredStatus, at, note: `Transfer ${action.status}.` },
                  ],
                }
              : r,
          )
        : state.requests;

      // Completion is the owner's confirmation that the units came back and
      // were checked: only now is the reservation released back to inventory.
      // Returning alone does not make equipment available again.
      let equipment = state.equipment;
      if (action.status === 'Completed') {
        equipment = state.equipment.map((e) => {
          if (e.id !== updated.equipmentId) return e;
          const releasedQuantity = Math.min(e.quantity, e.availableQuantity + updated.quantity);
          return {
            ...e,
            availableQuantity: releasedQuantity,
            availability: recalcAvailability(e.availability, releasedQuantity, e.quantity),
            updatedAt: at,
          };
        });
      }

      return {
        ...state,
        transfers: state.transfers.map((t) => (t.id === action.id ? updated : t)),
        requests,
        equipment,
        activities: withActivity(state, {
          type: 'transfer_updated',
          description: `Transfer ${updated.id} (${updated.equipmentName}) marked ${action.status}.`,
          relatedId: updated.id,
          status: action.status,
        }),
      };
    }

    case 'settings/update': {
      const settings: UserSettings = {
        ...state.settings,
        ...action.patch,
        institution: { ...state.settings.institution, ...action.patch.institution },
        user: { ...state.settings.user, ...action.patch.user },
        preferences: { ...state.settings.preferences, ...action.patch.preferences },
      };
      return {
        ...state,
        settings,
        activities: withActivity(state, {
          type: 'settings_updated',
          description: 'Updated workspace settings.',
          relatedId: 'SETTINGS',
        }),
      };
    }

    case 'role/set':
      // Demo-only capability preview: switching role changes permissions, not
      // the underlying data or the working login. No activity is recorded.
      return action.role === state.demoRole ? state : { ...state, demoRole: action.role };

    case 'workspace/reset':
      return createSeedState();

    default:
      return state;
  }
}

/** Whether a value is a plain (non-array, non-null) object. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Restore the persisted snapshot with a per-field shape guard: each collection
 * is accepted only if it is an array of objects, and scalar/object fields are
 * type-checked. Corrupted pieces fall back to their seed values instead of
 * discarding the whole snapshot (or crashing a page with malformed items).
 */
function parsePersisted(parsed: unknown): WorkspaceState | null {
  if (!isRecord(parsed)) return null;
  const seed = createSeedState();

  const pickArray = <T,>(value: unknown, fallback: T[]): T[] =>
    Array.isArray(value) && value.every(isRecord) ? (value as T[]) : fallback;
  const pickString = (value: unknown, fallback: string): string =>
    typeof value === 'string' && value.length > 0 ? value : fallback;
  const pickRecord = <T extends object>(value: unknown, fallback: T): T =>
    isRecord(value) ? ({ ...fallback, ...value } as T) : fallback;

  const settings = isRecord(parsed.settings)
    ? {
        ...seed.settings,
        institution: pickRecord(parsed.settings.institution, seed.settings.institution),
        user: pickRecord(parsed.settings.user, seed.settings.user),
        preferences: pickRecord(parsed.settings.preferences, seed.settings.preferences),
      }
    : seed.settings;

  const demoRole = DEMO_ROLES.some((role) => role.id === parsed.demoRole)
    ? (parsed.demoRole as DemoRoleId)
    : seed.demoRole;

  return {
    currentInstitutionId: pickString(parsed.currentInstitutionId, seed.currentInstitutionId),
    demoRole,
    institutions: pickArray(parsed.institutions, seed.institutions),
    equipment: pickArray(parsed.equipment, seed.equipment),
    requests: pickArray(parsed.requests, seed.requests),
    transfers: pickArray(parsed.transfers, seed.transfers),
    activities: pickArray(parsed.activities, seed.activities),
    settings,
  };
}

/** Parse a raw storage entry, returning null when absent or malformed. */
function readPersisted(storage: Storage): WorkspaceState | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parsePersisted(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/**
 * Load the initial workspace state from `localStorage`. When it is empty (a
 * first launch after the Prompt 9 change), a legacy `sessionStorage` snapshot
 * is migrated once — but only if it is valid, and never over an existing
 * localStorage value. Malformed data in either store falls back to seed data,
 * and the migrated session entry is cleared so it is never re-migrated.
 */
function loadInitialState(): WorkspaceState {
  if (typeof window === 'undefined') return createSeedState();

  const persisted = readPersisted(window.localStorage);
  if (persisted) return persisted;

  const legacy = readPersisted(window.sessionStorage);
  if (legacy) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage-access failures; the effect below re-persists to localStorage.
    }
    return legacy;
  }

  return createSeedState();
}

interface WorkspaceContextValue {
  state: WorkspaceState;
  addEquipment: (draft: EquipmentDraft) => void;
  updateEquipment: (id: string, draft: EquipmentDraft) => void;
  deleteEquipment: (id: string) => void;
  createRequest: (draft: RequestDraft) => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string, reason: string) => void;
  cancelRequest: (id: string) => void;
  createTransfer: (requestId: string) => void;
  advanceTransfer: (id: string, status: TransferStatus, note?: string) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  setDemoRole: (role: DemoRoleId) => void;
  resetWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

/**
 * Centralized, locally-persisted workspace store shared by all `/app` modules.
 * This is the mock-mode persistence engine: the service layer reads the live
 * state snapshot through `WorkspaceAccess.getState()`, while feature mutations
 * flow through the services (`useServices()`), which validate rules and
 * dispatch here. State is persisted to `localStorage` so demo changes survive
 * browser and tab restarts.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota/serialization failures — prototype continues in memory.
    }
  }, [state]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      state,
      addEquipment: (draft) => dispatch({ type: 'equipment/add', draft }),
      updateEquipment: (id, draft) => dispatch({ type: 'equipment/update', id, draft }),
      deleteEquipment: (id) => dispatch({ type: 'equipment/delete', id }),
      createRequest: (draft) => dispatch({ type: 'request/create', draft }),
      approveRequest: (id) => dispatch({ type: 'request/approve', id }),
      rejectRequest: (id, reason) => dispatch({ type: 'request/reject', id, reason }),
      cancelRequest: (id) => dispatch({ type: 'request/cancel', id }),
      createTransfer: (requestId) => dispatch({ type: 'transfer/create', requestId }),
      advanceTransfer: (id, status, note) =>
        dispatch({ type: 'transfer/advance', id, status, note }),
      updateSettings: (patch) => dispatch({ type: 'settings/update', patch }),
      setDemoRole: (role) => dispatch({ type: 'role/set', role }),
      resetWorkspace: () => dispatch({ type: 'workspace/reset' }),
    }),
    [state],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

/** Access the workspace store. Throws outside <WorkspaceProvider>. */
export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (ctx === undefined)
    throw new Error('useWorkspace must be used within a <WorkspaceProvider>.');
  return ctx;
}

/** The institution the signed-in administrator operates for. */
export function useCurrentInstitutionId(): string {
  const { state } = useWorkspace();
  return state.currentInstitutionId;
}
