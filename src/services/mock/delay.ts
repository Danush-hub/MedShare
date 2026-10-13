/**
 * Simulated latency budget so mock calls keep the same async ergonomics as
 * the future REST client (loading states, awaiting) — no network is involved.
 */
export function delay(ms = 120): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
