import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth';
import { WorkspaceProvider } from '@/features/workspace';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { DataModeGate, ServicesProvider } from '@/services/ServiceProvider';

/**
 * Composes global providers.
 *
 * Order matters: `DataModeGate` validates `VITE_DATA_MODE` before anything
 * boots (rendering a clear config error for an unsupported value), then the
 * `ServicesProvider` binds the selected service implementations to the
 * centralized `WorkspaceProvider` store. Additional cross-cutting providers
 * (theme, query client, etc.) are added here as features grow, keeping App.tsx
 * free of wiring concerns.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <DataModeGate>
        <AuthProvider>
          <WorkspaceProvider>
            <ServicesProvider>
              <ToastProvider>{children}</ToastProvider>
            </ServicesProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </DataModeGate>
    </ErrorBoundary>
  );
}
