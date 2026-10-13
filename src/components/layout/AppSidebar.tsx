import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { MedShareLogo } from '@/components/common/MedShareLogo';
import { useAuth } from '@/features/auth';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { APP_NAV } from '@/constants';
import { ROUTES } from '@/constants';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';

interface AppSidebarProps {
  /** Called when a link is followed on mobile (closes the drawer). */
  onNavigate?: () => void;
  /** Collapse to an icon-only rail (desktop). */
  collapsed?: boolean;
  /** Render the brand row (hidden when the layout shows it separately). */
  showBrand?: boolean;
}

/** Primary navigation rail for the authenticated application. */
export function AppSidebar({
  onNavigate,
  collapsed = false,
  showBrand = true,
}: AppSidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const services = useServices();
  const settingsQuery = useServiceQuery(() => services.settings.getSettings(), [services]);
  const user = settingsQuery.data?.user;

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      {showBrand && (
        <div className={cn('flex h-16 items-center border-b border-line', collapsed ? 'justify-center px-2' : 'px-5')}>
          {collapsed ? (
            <MedShareLogo size={30} showWordmark={false} />
          ) : (
            <MedShareLogo size={30} />
          )}
        </div>
      )}

      <nav aria-label="Application" className="flex-1 space-y-1 overflow-y-auto p-3">
        {APP_NAV.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-field px-3 py-2.5 text-sm font-medium transition',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={cn('border-t border-line p-3', collapsed && 'px-2')}>
        <div className={cn('flex items-center gap-3', collapsed && 'flex-col gap-2')}>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-navy text-sm font-semibold text-white">
            {initials(user?.displayName ?? '')}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{user?.displayName ?? 'Signed in'}</p>
              <p className="truncate text-xs text-ink-muted">{user?.role ?? ''}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className={cn(
            'mt-3 flex w-full items-center gap-2 rounded-field border border-line px-3 py-2 text-sm font-medium text-ink-muted transition hover:border-line-strong hover:bg-surface-muted hover:text-ink',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
}
