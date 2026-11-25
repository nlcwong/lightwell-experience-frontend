import type { CompletedCoverageReport } from 'services/Lightwell/CoverageReportsApi';
import { PARTIAL_LEVEL_COLORS } from './chartTheme';

export const COVERAGE_DONUT_WIDTH = 320;
export const COVERAGE_DONUT_HEIGHT = 280;
export const COVERAGE_DONUT_PADDING = { bottom: 10, left: 10, right: 10, top: 10 };
export const COVERAGE_DONUT_TITLE_LINE_HEIGHT = 1.6;

type MatchCounts = Pick<CompletedCoverageReport, 'exact_matches' | 'partial_matches' | 'total'>;

export const getMatchedPackagePercentage = ({
  exact_matches,
  partial_matches,
  total,
}: MatchCounts): number =>
  total > 0 ? Math.round(((exact_matches + partial_matches) / total) * 100) : 0;

export const getMatchDonutChartHeight = (width: number): number =>
  Math.round((width * COVERAGE_DONUT_HEIGHT) / COVERAGE_DONUT_WIDTH);

export type DonutDatum = {
  x: string;
  y: number;
};

// Unique keys for the inner ring's transparent padding slices (distinct keys matter:
// duplicate pie keys scramble Victory's colorScale index mapping).
const INNER_PAD_KEYS = ['exact-pad', 'unmatched-pad'];

export const getDonutData = (report: CompletedCoverageReport): DonutDatum[] => [
  { x: 'Exact match', y: report.exact_matches },
  { x: 'Partial match', y: report.partial_matches },
  { x: 'No match', y: report.unmatched },
];

export const getDonutLabel = ({ datum }: { datum: DonutDatum }): string =>
  `${datum.x}: ${datum.y} packages`;

// --- Nested inner ring: partial-match breakdown (major/minor/patch/none) ---

export type PartialBreakdownCounts = {
  major: number;
  minor: number;
  patch: number;
  none: number;
};

const PARTIAL_LEVELS = ['major', 'minor', 'patch', 'none'] as const;

/**
 * Distributes `target` across the four levels proportional to `weights`, rounding
 * so the four integers sum *exactly* to `target` (largest-remainder / Hamilton).
 */
const distributeExact = (
  weights: PartialBreakdownCounts,
  target: number,
): PartialBreakdownCounts => {
  const zero: PartialBreakdownCounts = { major: 0, minor: 0, patch: 0, none: 0 };
  const weightSum = PARTIAL_LEVELS.reduce((sum, level) => sum + weights[level], 0);
  if (weightSum <= 0 || target <= 0) {
    return zero;
  }

  const ideal = PARTIAL_LEVELS.map((level) => {
    const value = (weights[level] / weightSum) * target;
    return { level, floor: Math.floor(value), remainder: value - Math.floor(value) };
  });

  const result = { ...zero };
  ideal.forEach(({ level, floor }) => {
    result[level] = floor;
  });

  let leftover = target - ideal.reduce((sum, { floor }) => sum + floor, 0);
  const byRemainderDesc = [...ideal].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; leftover > 0; i += 1, leftover -= 1) {
    result[byRemainderDesc[i % byRemainderDesc.length].level] += 1;
  }
  return result;
};

/**
 * Report-wide partial-match breakdown, derived from per-ecosystem
 * `ecosystem_coverage_percentages` (× each ecosystem's total) and scaled to sum
 * exactly to `partial_matches`. Returns null when the percentages are absent.
 */
export const getPartialBreakdownCounts = (
  report: CompletedCoverageReport,
): PartialBreakdownCounts | null => {
  const percentages = report.ecosystem_coverage_percentages;
  if (!percentages || percentages.length === 0) {
    return null;
  }

  const totalByEcosystem = new Map(
    report.ecosystem_coverage_summary.map((eco) => [eco.ecosystem, eco.total]),
  );

  const weights: PartialBreakdownCounts = { major: 0, minor: 0, patch: 0, none: 0 };
  for (const pct of percentages) {
    const total = totalByEcosystem.get(pct.ecosystem) ?? 0;
    weights.major += (pct.major / 100) * total;
    weights.minor += (pct.minor / 100) * total;
    weights.patch += (pct.patch / 100) * total;
    weights.none += (pct.none / 100) * total;
  }

  return distributeExact(weights, report.partial_matches);
};

/**
 * Inner-ring slices aligned under the outer Partial arc: transparent padding sized
 * to exact/unmatched bookends the four colored partial levels. Inner total equals
 * the outer total so (with padAngle 0) the rings share one angular scale.
 */
export const getInnerDonutData = (report: CompletedCoverageReport): DonutDatum[] | null => {
  const breakdown = getPartialBreakdownCounts(report);
  if (!breakdown) {
    return null;
  }
  // Order: Patch → Minor → Major → None, so Patch lands at the outer Exact↔Partial
  // boundary (first colored wedge) and None borders the No-match arc. Transparent
  // padding (unique keys) bookends the colored wedges so they align under the Partial arc.
  return [
    { x: INNER_PAD_KEYS[0], y: report.exact_matches },
    { x: 'Same Patch', y: breakdown.patch },
    { x: 'Same Minor', y: breakdown.minor },
    { x: 'Same Major', y: breakdown.major },
    { x: 'Different Major', y: breakdown.none },
    { x: INNER_PAD_KEYS[1], y: report.unmatched },
  ];
};

// Colors map to getInnerDonutData by index (Victory applies colorScale[i] → data[i]);
// padding is transparent at both ends.
export const getInnerDonutColorScale = (): string[] => [
  'transparent',
  PARTIAL_LEVEL_COLORS.patch,
  PARTIAL_LEVEL_COLORS.minor,
  PARTIAL_LEVEL_COLORS.major,
  PARTIAL_LEVEL_COLORS.none,
  'transparent',
];

// No tooltip on the transparent padding segments.
export const getInnerDonutLabel = ({ datum }: { datum: DonutDatum }): string | null =>
  INNER_PAD_KEYS.includes(datum.x) ? null : `${datum.x}: ${datum.y} packages`;
