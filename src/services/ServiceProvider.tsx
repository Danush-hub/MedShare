import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useWorkspace } from '@/features/workspace/store';
import { env } from '@/lib/env';
import { createServices, resolveDataMode } from './config/factory';
import type { AppServices } from './contracts';
import { toServiceError } from './errors';
import type { WorkspaceAccess } from './mock';

const ServicesContext = createContext<AppServices | undefined>(undefined);

/**
 * Selects the service implementations once (via the `VITE_DATA_MODE`
 * factory) and binds them to the centralized workspace store. Feature
 * components read them through `useServices()` and never import mock or
 * HTTP modules directly — that is what keeps the UI independent of the
 * data source.
 *
 * Must render inside `<WorkspaceProvider>`.
 */
export function ServicesProvider({ children }: { children: ReactNode }) {
  const workspace = useWorkspace();

  const services = useMemo<AppServices>(() => {
    const access: WorkspaceAccess = {
      getState: () => workspace.state,
      addEquipment: workspace.addEquipment,
      updateEquipment: workspace.updateEquipment,
      deleteEquipment: workspace.deleteEquipment,
      createRequest: workspace.createRequest,
      approveRequest: workspace.approveRequest,
      rejectRequest: workspace.rejectRequest,
      cancelRequest: workspace.cancelRequest,
      createTransfer: workspace.createTransfer,
      advanceTransfer: workspace.advanceTransfer,
      updateSettings: workspace.updateSettings,
      resetWorkspace: workspace.resetWorkspace,
    };
    return createServices(resolveDataMode(env.dataMode), access);
    // Rebuilt whenever the store snapshot changes so `getState()` closures
    // always observe the live dataset at call time.
  }, [workspace]);

  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

/** Access the active feature services (mock or future REST implementations). */
export function useServices(): AppServices {
  const ctx = useContext(ServicesContext);
  if (ctx === undefined) throw new Error('useServices must be used within a <ServicesProvider>.');
  return ctx;
}

/**
 * Validates `VITE_DATA_MODE` before the app boots. An unsupported value
 * renders a clear configuration error instead of silently pretending a
 * backend exists.
 */
export function DataModeGate({ children }: { children: ReactNode }) {
  const configError = useMemo(() => {
    try {
      resolveDataMode(env.dataMode);
      return null;
    } catch (error) {
      return toServiceError(error);
    }
  }, []);

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted p-6">
        <div className="max-w-md rounded-card border border-line bg-white p-8 shadow-card">
          <h1 className="text-lg font-semibold text-ink">Invalid application configuration</h1>
          <p className="mt-3 text-sm text-ink-muted">{configError.message}</p>
          <p className="mt-3 text-xs text-ink-subtle">
            The local prototype only needs <code>VITE_DATA_MODE=mock</code> (the default when the
            variable is not set). See <code>.env.example</code> and <code>docs/ARCHITECTURE.md</code>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
