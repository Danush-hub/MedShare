/**
 * Centralized authorization model for the MedShare prototype.
 *
 * This is a lightweight, mock-data permission system used to *demonstrate*
 * product behavior — it is NOT production security. Real authorization must be
 * enforced by a backend; frontend checks here are convenience and can be
 * bypassed by a determined client.
 *
 * Roles are defined once, here, and every capability check flows through
 * `hasPermission` so page components never hardcode role names. The active demo
 * role lives on the workspace store (`state.demoRole`) and can be previewed from
 * the top bar without affecting the working `admin` / `1234` login.
 */

/** Discrete capabilities a role may grant. Add new actions here, not in pages. */
export type Permission =
  | 'equipment:view'
  | 'equipment:manage'
  | 'requests:view'
  | 'requests:create'
  | 'requests:approve'
  | 'requests:cancel'
  | 'transfers:view'
  | 'transfers:update'
  | 'hospitals:view'
  | 'hospitals:manage'
  | 'activity:view'
  | 'settings:manage'
  | 'workspace:reset';

/** Stable identifiers for the demonstration roles (persisted in the store). */
export type DemoRoleId = 'administrator' | 'coordinator' | 'approver' | 'viewer';

export interface DemoRole {
  id: DemoRoleId;
  /** Friendly label shown in the role previewer and profile menu. */
  label: string;
  /** Short description of what the role is for, used in the previewer. */
  description: string;
  permissions: Permission[];
}

const ALL: Permission[] = [
  'equipment:view',
  'equipment:manage',
  'requests:view',
  'requests:create',
  'requests:approve',
  'requests:cancel',
  'transfers:view',
  'transfers:update',
  'hospitals:view',
  'hospitals:manage',
  'activity:view',
  'settings:manage',
  'workspace:reset',
];

/**
 * The example roles required by the brief. Each maps to a capability set; the
 * UI reads capabilities, never role names, so new roles are trivial to add.
 */
export const DEMO_ROLES: DemoRole[] = [
  {
    id: 'administrator',
    label: 'Hospital Administrator',
    description: "Manage the institution's profile, equipment, approvals and transfers.",
    permissions: ALL,
  },
  {
    id: 'coordinator',
    label: 'Equipment Coordinator',
    description: 'Manage equipment listings and availability, and raise borrow requests.',
    permissions: [
      'equipment:view',
      'equipment:manage',
      'requests:view',
      'requests:create',
      'requests:cancel',
      'transfers:view',
      'transfers:update',
      'hospitals:view',
      'activity:view',
    ],
  },
  {
    id: 'approver',
    label: 'Request Approver',
    description: 'Review incoming requests and approve, reject or dispatch them.',
    permissions: [
      'equipment:view',
      'requests:view',
      'requests:approve',
      'transfers:view',
      'transfers:update',
      'hospitals:view',
      'activity:view',
    ],
  },
  {
    id: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to permitted screens and records.',
    permissions: ['equipment:view', 'requests:view', 'transfers:view', 'hospitals:view', 'activity:view'],
  },
];

/** The role the workspace starts with — full access, matching the demo login. */
export const DEFAULT_DEMO_ROLE: DemoRoleId = 'administrator';

/** Look up a role definition by id, falling back to the default role. */
export function findDemoRole(id: DemoRoleId | string | undefined): DemoRole {
  return DEMO_ROLES.find((role) => role.id === id) ?? DEMO_ROLES[0]!;
}

/** Whether a role id grants a capability. */
export function hasPermission(roleId: DemoRoleId, permission: Permission): boolean {
  return findDemoRole(roleId).permissions.includes(permission);
}
