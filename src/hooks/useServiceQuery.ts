import { useCallback, useEffect, useRef, useState } from 'react';
import { toServiceError, type ServiceError } from '@/services/errors';

/**
 * Reusable read-side data-loading hook for the service contracts.
 *
 * Presentation components obtain application data through the service layer
 * (`useServices()`), never by reading the workspace store directly. Because the
 * mock services resolve asynchronously against the live store snapshot, this
 * hook gives pages a small, dependency-correct query primitive with the states
 * the UI needs — loading, success, empty and error — with no extra libraries.
 *
 * Semantics (stale-while-revalidate):
 * - `data` holds the last successful result; it is kept while a refetch runs so
 *   the UI never blanks out during background refreshes after a mutation.
 * - `loading` is true only until the first result settles.
 * - `refreshing` is true for later refetches that still have prior data.
 * - `error` is the last failure (normalized to a `ServiceError`), cleared on
 *   the next success.
 *
 * Stale/out-of-order protection: each run is tagged and older in-flight results
 * are ignored, so results never replace newer data, and unmounting safely stops
 * state updates.
 *
 * Pass a `deps` array that identifies the data source version. The services
 * object is rebuilt whenever the workspace state changes, so depending on the
 * relevant service (or the whole `services` object) automatically re-reads after
 * any mutation — exactly the "reads reflect the latest state" requirement.
 */
export interface ServiceQueryState<T> {
  /** Last successful result, or `undefined` before the first one resolves. */
  data: T | undefined;
  loading: boolean;
  refreshing: boolean;
  error: ServiceError | null;
  /** Manually re-run the query (e.g. a "Try again" action). */
  refetch: () => void;
}

export function useServiceQuery<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
): ServiceQueryState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);
  // Retained so `refetch` re-runs the latest closure without re-triggering the
  // effect (it is not listed in the effect's dependency array).
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  // Monotonic tag identifying the newest run; older results are discarded.
  const runIdRef = useRef(0);
  // Whether a successful result has ever been produced (distinguishes a first
  // load from a background refresh without reading state inside an updater).
  const hasDataRef = useRef(false);

  const run = useCallback(() => {
    const runId = ++runIdRef.current;
    if (hasDataRef.current) setRefreshing(true);
    else setLoading(true);

    fetcherRef
      .current()
      .then((result) => {
        if (runId !== runIdRef.current) return; // superseded by a newer run
        hasDataRef.current = true;
        setData(result);
        setError(null);
        setLoading(false);
        setRefreshing(false);
      })
      .catch((thrown: unknown) => {
        if (runId !== runIdRef.current) return;
        setError(toServiceError(thrown));
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    run();
    // On unmount (or before the next run) invalidate the current run so any
    // late resolution is ignored rather than updating an unmounted component.
    return () => {
      runIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, refreshing, error, refetch: run };
}
