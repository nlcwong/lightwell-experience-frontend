import { lightwellConfig } from 'kit/lightwell.config';
import type { LwMetricsTrendSeries } from 'kit/components/assemblies';

/**
 * Beacon submission-trends model (LWLP-1961).
 *
 * One metric per chart in the "submission trends" drawer. The call site renders
 * each with a `LwMetricsTrendChart`, and the title / help copy above it.
 *
 * NOTE: there is no backend for these metrics yet, so {@link buildBeaconTrends}
 * returns mocked, deterministic data (a linear ramp). When the API lands, swap
 * the body of `useBeaconTrends` to read it; this model and the drawer stay as-is.
 */
export type BeaconTrendMetric = {
  id: string;
  title: string;
  help: string;
  /** One series (single bars) or two (stacked). */
  series: [LwMetricsTrendSeries] | [LwMetricsTrendSeries, LwMetricsTrendSeries];
  /** Stacked only: label for the "sum" line in the tooltip. */
  totalLabel?: string;
};

export type BeaconTrends = {
  /** Month labels, oldest first — the rolling window the charts plot against. */
  months: string[];
  metrics: BeaconTrendMetric[];
};

const NETWORK_YOURS_FILL = lightwellConfig.colors.stepIcon.teal;
const NETWORK_OTHERS_FILL = lightwellConfig.colors.matchStatus.none;
const SHARED_FILL = lightwellConfig.colors.stepIcon.blue;

const DEFAULT_WINDOW_MONTHS = 6;

/**
 * Rolling window of short month labels (e.g. `['Jun', … 'Nov']`), oldest first,
 * ending on `now`'s month. A time-window chooser can later pass a different
 * `count` / anchor; the charts only care about the resulting labels.
 */
export function getRollingMonths(count = DEFAULT_WINDOW_MONTHS, now = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return d.toLocaleString('en-US', { month: 'short' });
  });
}

/** Deterministic cumulative ramp up to `end` across `length` points. */
const ramp = (end: number, length: number): number[] =>
  Array.from({ length }, (_, i) => Math.round((end * (i + 1)) / length));

/**
 * MOCK trends for a customer. Deterministic; not customer-specific yet.
 * Replace when the submission-trends API exists.
 */
export function buildBeaconTrends(months = getRollingMonths()): BeaconTrends {
  const n = months.length;
  return {
    months,
    metrics: [
      {
        id: 'network-fixes',
        title: 'Fixes in the Lightwell Network',
        help: 'Fixes completed for you each month, compared with fixes completed for all other members across the Lightwell Network. Together they make up the total number of fixes in the network.',
        totalLabel: 'Total fixes in the network',
        series: [
          { id: 'yours', label: 'Your fixes', data: ramp(5, n), fill: NETWORK_YOURS_FILL },
          {
            id: 'others',
            label: "Other members' fixes",
            data: ramp(36, n),
            fill: NETWORK_OTHERS_FILL,
          },
        ],
      },
      {
        id: 'shared-vulnerabilities',
        title: 'Shared Vulnerabilities',
        help: "The number of vulnerabilities you've submitted that at least one other member has also submitted, tracked cumulatively for each month since July.",
        series: [
          {
            id: 'shared',
            label: 'Shared vulnerabilities',
            data: ramp(23, n),
            fill: SHARED_FILL,
          },
        ],
      },
      {
        id: 'shared-packages',
        title: 'Shared Packages',
        help: 'The number of packages you requested fixes for that other members also requested, tracked cumulatively for each month since July.',
        series: [{ id: 'shared', label: 'Shared packages', data: ramp(15, n), fill: SHARED_FILL }],
      },
    ],
  };
}
