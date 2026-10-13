import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { ROUTES } from '@/constants';

/**
 * Protected route guard for authenticated (`/app/*`) pages.
 *
 * Unauthenticated visitors are redirected to the login screen with their
 * intended destination preserved, so they return there after signing in.
 * Because the provider reads the session synchronously on load, this also
 * re-checks the session on refresh or a direct visit to a protected URL.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

/**
 * Guest-only guard for the authentication screens.
 *
 * Sends already-authenticated users away from `/login` and `/signup` to the
 * workspace, preventing a signed-in user from landing back on the forms.
 */
export function RedirectIfAuthenticated() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.app.root} replace />;
  }

  return <Outlet />;
}
