import { Info } from 'lucide-react';
import { env } from '@/lib/env';
import { LoginForm } from './components/LoginForm';

/**
 * Login screen. Renders the "Welcome Back" heading and the functional sign-in
 * form inside the shared <AuthLayout> split shell.
 */
export function LoginPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome Back</h1>
        <p className="text-sm leading-6 text-ink-muted">
          Sign in to manage equipment sharing and coordinate healthcare resources.
        </p>
      </header>

      <LoginForm />

      {/* The demo credentials only exist in the mock service — showing them in
          API mode would be misleading, since login there fails NOT_IMPLEMENTED. */}
      {env.dataMode === 'mock' && (
        <p className="rounded-field border border-primary-100 bg-primary-light px-3 py-2.5 text-center text-xs leading-5 text-info-foreground">
          Demo access: username <span className="font-semibold">admin</span> · password{' '}
          <span className="font-semibold">1234</span>
        </p>
      )}

      <p className="flex items-start justify-center gap-1.5 rounded-field bg-surface-muted px-3 py-2.5 text-center text-xs leading-5 text-ink-subtle">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Prototype demonstration with a simulated, client-side session. Not production
        authentication.
      </p>
    </div>
  );
}
