import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, Info, AlertTriangle, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextValue {
  notify: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toneStyles: Record<ToastTone, { icon: typeof Info; ring: string; text: string }> = {
  success: { icon: CheckCircle2, ring: 'text-success', text: 'text-success-foreground' },
  info: { icon: Info, ring: 'text-primary', text: 'text-info-foreground' },
  warning: { icon: AlertTriangle, ring: 'text-warning', text: 'text-warning-foreground' },
  error: { icon: XCircle, ring: 'text-error', text: 'text-error-foreground' },
};

/** Global, dependency-free toast notifications for local action feedback. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = (counter.current += 1);
      setToasts((current) => [...current, { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      notify,
      success: (title, description) => notify({ tone: 'success', title, description }),
      info: (title, description) => notify({ tone: 'info', title, description }),
      warning: (title, description) => notify({ tone: 'warning', title, description }),
      error: (title, description) => notify({ tone: 'error', title, description }),
    }),
    [notify],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const { icon: Icon, ring, text } = toneStyles[toast.tone];
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-card animate-fade-in"
              role="status"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', ring)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm font-semibold', text)}>{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-sm text-ink-muted">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-field text-ink-subtle hover:bg-surface-muted hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Access the toast API. Throws if used outside <ToastProvider>. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx === undefined) throw new Error('useToast must be used within a <ToastProvider>.');
  return ctx;
}
