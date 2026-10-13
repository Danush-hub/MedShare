import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ROUTES } from '@/constants';
import { useAuth } from '../authContext';
import { PasswordField } from './PasswordField';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';

const loginSchema = z.object({
  username: z.string().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

/** Non-sensitive convenience: remember only the username for next time. */
const REMEMBER_KEY = 'medshare.demo.remembered-username';

function readRemembered(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(REMEMBER_KEY) ?? '';
  } catch {
    return '';
  }
}

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);

  const remembered = readRemembered();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: remembered, password: '', remember: Boolean(remembered) },
    mode: 'onBlur',
  });

  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.app.root;

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    try {
      await signIn(values.username, values.password);
      if (typeof window !== 'undefined') {
        if (values.remember) window.localStorage.setItem(REMEMBER_KEY, values.username.trim());
        else window.localStorage.removeItem(REMEMBER_KEY);
      }
      navigate(from, { replace: true });
    } catch (error) {
      // The service throws a user-safe ServiceError; anything else gets a generic note.
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Invalid username or password. Please try again.';
      setFormError(message);
      setError('root', { message });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-field border border-error/20 bg-error-soft px-3 py-2.5 text-sm text-error-foreground"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="login-username" required>
            Username or email
          </Label>
          <Input
            id="login-username"
            autoComplete="username"
            placeholder="admin"
            invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'login-username-error' : undefined}
            disabled={isSubmitting}
            {...register('username')}
          />
          {errors.username && (
            <p id="login-username-error" className="text-xs text-error">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password" required>
              Password
            </Label>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <PasswordField
            id="login-password"
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            disabled={isSubmitting}
            {...register('password')}
          />
          {errors.password && (
            <p id="login-password-error" className="text-xs text-error">
              {errors.password.message}
            </p>
          )}
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line-strong text-primary accent-primary focus-visible:shadow-focus"
            disabled={isSubmitting}
            {...register('remember')}
          />
          Remember me
        </label>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />

      <p className="pt-1 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.signup} className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
