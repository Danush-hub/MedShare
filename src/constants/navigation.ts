import {
  LayoutDashboard,
  Boxes,
  Search,
  FileText,
  Truck,
  Building2,
  History,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match the index route exactly (no descendant matching). */
  end?: boolean;
  /** Page title shown in the topbar breadcrumb. */
  title: string;
}

/**
 * Primary navigation for the authenticated workspace. Shared by the sidebar and
 * the topbar so route metadata (label + page title) never drifts apart.
 */
export const APP_NAV: NavItem[] = [
  { label: 'Overview', to: ROUTES.app.root, icon: LayoutDashboard, end: true, title: 'Overview' },
  { label: 'Equipment Inventory', to: ROUTES.app.equipment, icon: Boxes, title: 'Equipment Inventory' },
  { label: 'Find Equipment', to: ROUTES.app.findEquipment, icon: Search, title: 'Find Equipment' },
  { label: 'Requests', to: ROUTES.app.requests, icon: FileText, title: 'Requests' },
  { label: 'Transfers', to: ROUTES.app.transfers, icon: Truck, title: 'Transfers' },
  { label: 'Hospitals', to: ROUTES.app.hospitals, icon: Building2, title: 'Hospitals' },
  { label: 'Activity History', to: ROUTES.app.activity, icon: History, title: 'Activity History' },
  { label: 'Settings', to: ROUTES.app.settings, icon: Settings, title: 'Settings' },
];

/** Look up the nav metadata for a pathname (exact or descendant match). */
export function resolveNavItem(pathname: string): NavItem | undefined {
  const exact = APP_NAV.find((item) => item.to === pathname);
  if (exact) return exact;
  const descendant = APP_NAV.filter((item) => item.to !== ROUTES.app.root).find(
    (item) => pathname.startsWith(item.to + '/'),
  );
  return descendant ?? APP_NAV[0];
}
