import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/features/auth';
import { usePermissions } from '@/features/workspace';
import type { DemoRole } from '@/features/workspace/permissions';
import { ROUTES, resolveNavItem } from '@/constants';
import { formatRelativeTime, initials } from '@/lib/format';
import { Menu as DropdownMenu } from '@/components/ui/Menu';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';

interface AppTopbarProps {
  /** Opens the mobile navigation drawer. */
  onMenuClick: () => void;
  /** Toggles the desktop sidebar rail. */
  onToggleCollapse: () => void;
  collapsed: boolean;
}

/** Top bar for the authenticated application shell. */
export function AppTopbar({ onMenuClick, onToggleCollapse, collapsed }: AppTopbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const services = useServices();
  const activitiesQuery = useServiceQuery(() => services.activity.listActivities(), [services]);
  const settingsQuery = useServiceQuery(() => services.settings.getSettings(), [services]);
  const { role, roles, setRole } = usePermissions();
  const [query, setQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const current = resolveNavItem(pathname);
  const notifications = useMemo(
    () => (activitiesQuery.data ?? []).slice(0, 6),
    [activitiesQuery.data],
  );

  // Dismiss the notification panel on outside click.
  useEffect(() => {
    if (!notifOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setNotifOpen(false);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [notifOpen]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `${ROUTES.app.findEquipment}?q=${encodeURIComponent(trimmed)}` : ROUTES.app.findEquipment);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  const displayName = settingsQuery.data?.user.displayName || user?.displayName || 'Signed in';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/90 px-4 shadow-header backdrop-blur sm:px-6">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 items-center justify-center rounded-field border border-line text-ink-muted hover:bg-surface-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Desktop collapse */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="hidden h-10 w-10 items-center justify-center rounded-field text-ink-muted hover:bg-surface-muted lg:inline-flex"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {/* Page title + breadcrumb */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
          MedShare · Workspace
        </p>
        <h2 className="truncate text-sm font-semibold text-ink">{current?.title ?? 'Overview'}</h2>
      </div>

      {/* Search (desktop) */}
      <form onSubmit={handleSearch} className="hidden items-center md:flex" role="search">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search equipment…"
            aria-label="Search equipment"
            className="w-56 rounded-field border border-line bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus-visible:shadow-focus"
          />
        </div>
      </form>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          type="button"
          onClick={() => setNotifOpen((open) => !open)}
          aria-label="Notifications"
          aria-expanded={notifOpen}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-field text-ink-muted transition hover:bg-surface-muted hover:text-ink"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {notifications.length > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">Recent activity</p>
              <span className="text-xs text-ink-subtle">Sample data</span>
            </div>
            <ul className="max-h-80 divide-y divide-line overflow-y-auto">
              {notifications.map((activity) => (
                <li key={activity.id}>
                  <Link
                    to={ROUTES.app.activity}
                    onClick={() => setNotifOpen(false)}
                    className="block px-4 py-3 text-sm hover:bg-primary-light/50"
                  >
                    <p className="text-ink">{activity.description}</p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {formatRelativeTime(activity.at)}
                      {activity.relatedId ? ` · ${activity.relatedId}` : ''}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Profile menu */}
      <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pl-1 pr-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-navy text-xs font-semibold text-white">
          {initials(displayName)}
        </span>
        <span className="hidden max-w-[9rem] flex-col items-start leading-tight xl:flex">
          <span className="truncate text-xs font-semibold text-ink">{displayName}</span>
          <span className="truncate text-[11px] text-ink-subtle">{role.label}</span>
        </span>
        <DropdownMenu
          ariaLabel="Account and role menu"
          trigger={<UserRound className="h-4 w-4" aria-hidden="true" />}
          items={[
            {
              label: 'Profile',
              icon: <UserRound className="h-4 w-4" aria-hidden="true" />,
              onSelect: () => navigate(ROUTES.app.settings),
            },
            {
              label: 'Settings',
              icon: <SettingsIcon className="h-4 w-4" aria-hidden="true" />,
              onSelect: () => navigate(ROUTES.app.settings),
            },
            // Role preview: a demonstration aid, not real access control.
            ...roles.map((previewRole: DemoRole) => ({
              label: `Preview: ${previewRole.label}`,
              icon:
                previewRole.id === role.id ? (
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ),
              onSelect: () => setRole(previewRole.id),
            })),
            {
              label: 'Log out',
              tone: 'danger',
              icon: <LogOut className="h-4 w-4" aria-hidden="true" />,
              onSelect: handleSignOut,
            },
          ]}
        />
      </div>
    </header>
  );
}
