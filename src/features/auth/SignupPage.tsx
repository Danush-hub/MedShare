import { Link } from 'react-router-dom';
import { SignupForm } from './components/SignupForm';
import { ROUTES } from '@/constants';

/**
 * Signup screen. Institutional onboarding form rendered inside the shared
 * <AuthLayout> shell. Registration is a UI-level prototype — nothing is
 * persisted or verified, and no session is created.
 */
export function SignupPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Request access</h1>
        <p className="text-sm leading-6 text-ink-muted">
          Onboard your hospital or clinic to the MedShare equipment-sharing network.
        </p>
      </header>

      <SignupForm />

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
