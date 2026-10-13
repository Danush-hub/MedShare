import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { buttonVariants } from '@/components/ui/button-styles';
import { ROUTES } from '@/constants';
import { PasswordField } from './PasswordField';

const INSTITUTION_TYPES = ['Hospital', 'Clinic', 'Other'] as const;

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name.'),
    email: z.string().min(1, 'Enter your work email.').email('Enter a valid email address.'),
    username: z.string().min(3, 'Username must be at least 3 characters.'),
    institutionName: z.string().min(2, 'Enter your hospital or clinic name.'),
    institutionType: z
      .string()
      .refine((value) => (INSTITUTION_TYPES as readonly string[]).includes(value), {
        message: 'Select an institution type.',
      }),
    jobRole: z.string().min(2, 'Enter your job role.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Re-enter your password.'),
    agree: z.boolean().refine((value) => value, {
      message: 'Please acknowledge the prototype notice to continue.',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type SignupValues = z.infer<typeof signupSchema>;

const selectBase =
  'w-full rounded-field border border-line bg-surface px-3.5 py-2.5 text-sm text-ink ' +
  'transition focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed ' +
  'disabled:bg-surface-muted';

export function SignupForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      institutionName: '',
      institutionType: '',
      jobRole: '',
      password: '',
      confirmPassword: '',
      agree: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = async () => {
    // No backend: hold the button briefly so double-submits are visually
    // prevented, then show the prototype confirmation. Nothing is persisted.
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmitted(true);
  };

  if (submitted) {
    return <SignupSuccess onReset={() => setSubmitted(false)} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="su-name" error={errors.fullName?.message} required>
          <Input
            id="su-name"
            autoComplete="name"
            invalid={Boolean(errors.fullName)}
            disabled={isSubmitting}
            {...register('fullName')}
          />
        </Field>

        <Field label="Work email" htmlFor="su-email" error={errors.email?.message} required>
          <Input
            id="su-email"
            type="email"
            autoComplete="email"
            invalid={Boolean(errors.email)}
            disabled={isSubmitting}
            {...register('email')}
          />
        </Field>

        <Field label="Username" htmlFor="su-username" error={errors.username?.message} required>
          <Input
            id="su-username"
            autoComplete="username"
            invalid={Boolean(errors.username)}
            disabled={isSubmitting}
            {...register('username')}
          />
        </Field>

        <Field label="Job role" htmlFor="su-role" error={errors.jobRole?.message} required>
          <Input
            id="su-role"
            placeholder="e.g. Equipment Coordinator"
            invalid={Boolean(errors.jobRole)}
            disabled={isSubmitting}
            {...register('jobRole')}
          />
        </Field>

        <Field
          label="Hospital or clinic name"
          htmlFor="su-institution"
          error={errors.institutionName?.message}
          required
          className="sm:col-span-2"
        >
          <Input
            id="su-institution"
            autoComplete="organization"
            invalid={Boolean(errors.institutionName)}
            disabled={isSubmitting}
            {...register('institutionName')}
          />
        </Field>

        <Field
          label="Institution type"
          htmlFor="su-type"
          error={errors.institutionType?.message}
          required
          className="sm:col-span-2"
        >
          <select
            id="su-type"
            className={selectBase}
            aria-invalid={Boolean(errors.institutionType) || undefined}
            disabled={isSubmitting}
            {...register('institutionType')}
          >
            <option value="">Select an option…</option>
            {INSTITUTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Password" htmlFor="su-password" error={errors.password?.message} required>
          <PasswordField
            id="su-password"
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            disabled={isSubmitting}
            {...register('password')}
          />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="su-confirm"
          error={errors.confirmPassword?.message}
          required
        >
          <PasswordField
            id="su-confirm"
            autoComplete="new-password"
            invalid={Boolean(errors.confirmPassword)}
            disabled={isSubmitting}
            {...register('confirmPassword')}
          />
        </Field>
      </div>

      <div className="space-y-1.5">
        <label className="flex cursor-pointer items-start gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-line-strong accent-primary focus-visible:shadow-focus"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.agree) || undefined}
            {...register('agree')}
          />
          <span>
            I understand this is a prototype and that no real hospital account is created or
            verified. I accept the prototype terms and privacy notice.
          </span>
        </label>
        {errors.agree && <p className="text-xs text-error">{errors.agree.message}</p>}
      </div>

      <Button type="submit" fullWidth isLoading={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Create account'}
      </Button>

      <p className="flex items-start gap-1.5 text-xs leading-5 text-ink-subtle">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Institutional registration and verification are not yet connected.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="space-y-1.5">
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
        {children}
      </div>
      {error && (
        <p className="mt-1 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function SignupSuccess({ onReset }: { onReset: () => void }) {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success-foreground">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-ink">Details received</h3>
        <p className="text-sm leading-6 text-ink-muted">
          This is a prototype demonstration only. No real hospital account has been created, and no
          identity has been verified. Institutional registration will be connected with the
          MedShare backend in a later phase.
        </p>
      </div>
      <div className="space-y-3">
        <Link to={ROUTES.login} className={buttonVariants({ fullWidth: true })}>
          Return to Login
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="block w-full text-sm font-medium text-ink-muted hover:text-ink"
        >
          Register another institution
        </button>
      </div>
    </div>
  );
}
