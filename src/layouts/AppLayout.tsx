import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
import { MedShareLogo } from '@/components/common/MedShareLogo';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';

/** Authenticated application shell: persistent sidebar on desktop, drawer on mobile. */
export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Reset the mobile drawer when growing to the desktop breakpoint.
  useEffect(() => {
    if (isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  // Close the mobile drawer on Escape for keyboard users.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-surface-background">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* Desktop sidebar (collapsible rail) */}
      <aside
        className={cn(
          'hidden shrink-0 border-r border-line bg-surface transition-[width] duration-200 lg:block',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className="sticky top-0 h-screen overflow-y-auto">
          <AppSidebar collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          drawerOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!drawerOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/40 transition-opacity',
            drawerOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-64 flex-col bg-surface shadow-card transition-transform',
            drawerOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          role="dialog"
          aria-label="Navigation"
        >
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <MedShareLogo size={30} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-field text-ink-muted hover:bg-surface-muted"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <AppSidebar showBrand={false} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </aside>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          onMenuClick={() => setDrawerOpen(true)}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          collapsed={collapsed}
        />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
