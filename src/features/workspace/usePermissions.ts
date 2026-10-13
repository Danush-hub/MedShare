import { useCallback, useMemo } from 'react';
import { useWorkspace } from './store';
import {
  DEMO_ROLES,
  findDemoRole,
  type DemoRole,
  type DemoRoleId,
  type Permission,
} from './permissions';

/**
 * Access the active demo role and its capabilities.
 *
 * Pages call `can(permission)` to decide whether to show, disable or perform an
 * action — role checks are centralized here rather than scattered across
 * components. `setRole` powers the top-bar role previewer so a reviewer can see
 * how each role behaves without re-logging in.
 *
 * This governs UI behavior only; it is not a security boundary.
 */
export interface PermissionsValue {
  role: DemoRole;
  roles: DemoRole[];
  /** Whether the active role grants a capability. */
  can: (permission: Permission) => boolean;
  /** Switch the previewed demo role. */
  setRole: (role: DemoRoleId) => void;
}

export function usePermissions(): PermissionsValue {
  const { state, setDemoRole } = useWorkspace();
  const role = useMemo(() => findDemoRole(state.demoRole), [state.demoRole]);
  const can = useCallback((permission: Permission) => role.permissions.includes(permission), [role]);
  return { role, roles: DEMO_ROLES, can, setRole: setDemoRole };
}
