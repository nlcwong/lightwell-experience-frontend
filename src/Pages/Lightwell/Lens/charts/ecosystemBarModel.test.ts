import { formatPartialBreakdown, getEcosystemChartModel } from './ecosystemBarModel';
import type {
  CompletedCoverageReport,
  EcosystemCoveragePercentages,
} from 'services/Lightwell/CoverageReportsApi';

const javaPct: EcosystemCoveragePercentages = {
  ecosystem: 'Java',
  exact: 20,
  major: 0,
  minor: 20,
  patch: 20,
  none: 20,
  no_coverage: 20,
};

const makeReport = (percentages?: EcosystemCoveragePercentages[]): CompletedCoverageReport => ({
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
});

describe('formatPartialBreakdown', () => {
  it('lists Same Patch/Minor/Major, Different Major with count (pct%) in donut order', () => {
    // Java total 5: patch/minor/none = 20% = 1 pkg each, major 0% = 0.
    expect(formatPartialBreakdown(javaPct, 5)).toBe(
      'Same Patch: 1 (20%)\nSame Minor: 1 (20%)\nSame Major: 0 (0%)\nDifferent Major: 1 (20%)',
    );
  });

  it('keeps one decimal only when needed and derives counts from the total', () => {
    expect(
      formatPartialBreakdown(
        {
          ecosystem: 'Java',
          exact: 69.2,
          major: 1.6,
          minor: 4.6,
          patch: 7.7,
          none: 3.1,
          no_coverage: 13.8,
        },
        1000,
      ),
    ).toBe(
      'Same Patch: 77 (7.7%)\nSame Minor: 46 (4.6%)\nSame Major: 16 (1.6%)\nDifferent Major: 31 (3.1%)',
    );
  });
});

describe('getEcosystemChartModel', () => {
  it('attaches the partial breakdown to the partial series only', () => {
    const model = getEcosystemChartModel(makeReport([javaPct]));

    expect(model.partialPackages[0].tooltipDetail).toBe(
      'Same Patch: 1 (20%)\nSame Minor: 1 (20%)\nSame Major: 0 (0%)\nDifferent Major: 1 (20%)',
    );
    expect(model.exactPackages[0].tooltipDetail).toBeUndefined();
    expect(model.unmatchedPackages[0].tooltipDetail).toBeUndefined();
  });

  it('leaves tooltipDetail undefined when percentages are absent', () => {
    const model = getEcosystemChartModel(makeReport());

    expect(model.partialPackages[0].tooltipDetail).toBeUndefined();
  });
});
