import {
  getInnerDonutColorScale,
  getInnerDonutData,
  getInnerDonutLabel,
  getPartialBreakdownCounts,
} from './matchDonutModel';
import type {
  CompletedCoverageReport,
  EcosystemCoveragePercentages,
} from 'services/Lightwell/CoverageReportsApi';

const makeReport = (
  overrides: Partial<CompletedCoverageReport> & {
    percentages?: EcosystemCoveragePercentages[];
  } = {},
): CompletedCoverageReport => {
  const { percentages, ...rest } = overrides;
  return {
    uuid: 'report',
    status: 'completed',
    created_at: '2026-11-20T00:00:00Z',
    completed_at: '2026-11-20T00:00:01Z',
    total: 5,
    exact_matches: 1,
    partial_matches: 3,
    unmatched: 1,
    cve_summary: { critical: 0, important: 0, moderate: 0, low: 0 },
    ecosystem_coverage_summary: [
      {
        ecosystem: 'Java',
        supported: true,
        total: 5,
        exact_matches: 1,
        partial_matches: 3,
        unmatched: 1,
      },
    ],
    ...(percentages ? { ecosystem_coverage_percentages: percentages } : {}),
    ...rest,
  };
};

const javaPct: EcosystemCoveragePercentages = {
  ecosystem: 'Java',
  exact: 20,
  major: 0,
  minor: 20,
  patch: 20,
  none: 20,
  no_coverage: 20,
};

describe('getPartialBreakdownCounts', () => {
  it('returns null when percentages are absent', () => {
    expect(getPartialBreakdownCounts(makeReport())).toBeNull();
  });

  it('derives the per-level counts from percentages × ecosystem total', () => {
    // Java total 5: minor/patch/none = 20% = 1 pkg each, major 0 → {0,1,1,1}.
    expect(getPartialBreakdownCounts(makeReport({ percentages: [javaPct] }))).toEqual({
      major: 0,
      minor: 1,
      patch: 1,
      none: 1,
    });
  });

  it('scales the four levels to sum exactly to partial_matches (no rounding drift)', () => {
    // Fractional weights (total 7, uneven %s) must still sum to partial_matches.
    const report = makeReport({
      total: 7,
      exact_matches: 2,
      partial_matches: 3,
      unmatched: 2,
      ecosystem_coverage_summary: [
        {
          ecosystem: 'Java',
          supported: true,
          total: 7,
          exact_matches: 2,
          partial_matches: 3,
          unmatched: 2,
        },
      ],
      percentages: [
        {
          ecosystem: 'Java',
          exact: 28.6,
          major: 10,
          minor: 20,
          patch: 20,
          none: 0,
          no_coverage: 0,
        },
      ],
    });
    const counts = getPartialBreakdownCounts(report)!;
    expect(counts.major + counts.minor + counts.patch + counts.none).toBe(3);
  });
});

describe('getInnerDonutData', () => {
  it('returns null when percentages are absent', () => {
    expect(getInnerDonutData(makeReport())).toBeNull();
  });

  it('bookends the colored partial levels with transparent padding and matches the outer total', () => {
    const data = getInnerDonutData(makeReport({ percentages: [javaPct] }))!;

    // [exact-pad, Patch, Minor, Major, Partial – none, unmatched-pad]
    expect(data).toHaveLength(6);
    expect(data[0]).toEqual({ x: '', y: 1 }); // exact padding
    expect(data[5]).toEqual({ x: '', y: 1 }); // unmatched padding
    expect(data.map((d) => d.x)).toEqual(['', 'Patch', 'Minor', 'Major', 'Partial – none', '']);

    // Colored span equals partial_matches; total equals the report total (alignment).
    const colored = data.slice(1, 5).reduce((sum, d) => sum + d.y, 0);
    expect(colored).toBe(3);
    expect(data.reduce((sum, d) => sum + d.y, 0)).toBe(5);
  });
});

describe('getInnerDonutColorScale', () => {
  it('is 6 entries with transparent padding at both ends', () => {
    const scale = getInnerDonutColorScale();
    expect(scale).toHaveLength(6);
    expect(scale[0]).toBe('transparent');
    expect(scale[5]).toBe('transparent');
  });
});

describe('getInnerDonutLabel', () => {
  it('labels colored wedges and suppresses the padding tooltip', () => {
    expect(getInnerDonutLabel({ datum: { x: 'Minor', y: 2 } })).toBe('Minor: 2 packages');
    expect(getInnerDonutLabel({ datum: { x: '', y: 1 } })).toBeNull();
  });
});
