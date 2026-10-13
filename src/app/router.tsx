import { Suspense, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/features/landing/LandingPage';
import { LoginPage, SignupPage, RequireAuth, RedirectIfAuthenticated } from '@/features/auth';
import { NotFoundPage } from './NotFoundPage';

/**
 * Route-level code splitting for the guarded `/app` pages.
 *
 * Each feature page is behind `RequireAuth` anyway, so lazily loading the
 * page elements keeps dashboard/equipment/requests/transfers/... out of the
 * initial bundle: the shared app shell (auth guard, layouts, providers) stays
 * eager, while each `/app` route's page-specific code loads as one small
 * chunk on demand. React Router awaits the import and mounts the element once
 * resolved, so routes, guards and behavior are unchanged. `element:` (rather
 * than `Component:`) is used deliberately — it suspends inside this route's
 * layout element and inherits the ancestor provider context; the top-level
 * `ErrorBoundary` in `providers.tsx` remains the safety net if a chunk ever
 * fails to load.
 */
const lazyNamed =
  <M extends Record<string, unknown>>(importer: () => Promise<M>, name: keyof M & string) =>
  async () => {
    const mod = await importer();
    const Page = mod[name] as ComponentType;
    return {
      element: (
        <Suspense fallback={null}>
          <Page />
        </Suspense>
      ),
    };
  };

/**
 * Application route map.
 * Clear split between public, authentication and guarded application routes.
 */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: ROUTES.home, element: <LandingPage /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        element: <RedirectIfAuthenticated />,
        children: [
          { path: ROUTES.login, element: <LoginPage /> },
          { path: ROUTES.signup, element: <SignupPage /> },
        ],
      },
    ],
  },
  {
    path: ROUTES.app.root,
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            lazy: lazyNamed(() => import('@/features/dashboard/DashboardPage'), 'DashboardPage'),
          },
          {
            path: 'equipment',
            lazy: lazyNamed(() => import('@/features/equipment/EquipmentPage'), 'EquipmentPage'),
          },
          {
            path: 'find-equipment',
            lazy: lazyNamed(
              () => import('@/features/findEquipment/FindEquipmentPage'),
              'FindEquipmentPage',
            ),
          },
          {
            path: 'requests',
            lazy: lazyNamed(() => import('@/features/requests/RequestsPage'), 'RequestsPage'),
          },
          {
            path: 'transfers',
            lazy: lazyNamed(() => import('@/features/transfers/TransfersPage'), 'TransfersPage'),
          },
          {
            path: 'hospitals',
            lazy: lazyNamed(() => import('@/features/hospitals/HospitalsPage'), 'HospitalsPage'),
          },
          {
            path: 'activity',
            lazy: lazyNamed(() => import('@/features/activity/ActivityPage'), 'ActivityPage'),
          },
          {
            path: 'settings',
            lazy: lazyNamed(() => import('@/features/settings/SettingsPage'), 'SettingsPage'),
          },
        ],
      },
    ],
  },
  { path: ROUTES.notFound, element: <NotFoundPage /> },
]);
