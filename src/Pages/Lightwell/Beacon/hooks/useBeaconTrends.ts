import { useMemo } from 'react';

import { buildBeaconTrends, getRollingMonths, type BeaconTrends } from '../trends';

/**
 * Beacon submission-trends for a customer.
 *
 * No backend exists for these metrics yet (LWLP-1961), so this returns
 * deterministic MOCK data over a rolling 6-month window. When the API lands,
 * replace the body with the real query (e.g. `useQuery`) — the return shape and
 * the drawer that consumes it should not need to change.
 */
export function useBeaconTrends(customerId?: string): { data: BeaconTrends | undefined } {
  const data = useMemo<BeaconTrends | undefined>(
    () => (customerId ? buildBeaconTrends(getRollingMonths()) : undefined),
    [customerId],
  );
  return { data };
}
