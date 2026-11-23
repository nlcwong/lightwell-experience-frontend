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
  it('lists Major, Minor, Patch, None one per line with a dash separator', () => {
    expect(formatPartialBreakdown(javaPct)).toBe(
      'Major - 0%\nMinor - 20%\nPatch - 20%\nNone - 20%',
    );
  });

  it('keeps one decimal only when needed', () => {
    expect(
      formatPartialBreakdown({
        ecosystem: 'Java',
        exact: 69.2,
        major: 1.6,
        minor: 4.6,
        patch: 7.7,
        none: 3.1,
        no_coverage: 13.8,
      }),
    ).toBe('Major - 1.6%\nMinor - 4.6%\nPatch - 7.7%\nNone - 3.1%');
  });
});

describe('getEcosystemChartModel', () => {
  it('attaches the partial breakdown to the partial series only', () => {
    const model = getEcosystemChartModel(makeReport([javaPct]));

    expect(model.partialPackages[0].tooltipDetail).toBe(
      'Major - 0%\nMinor - 20%\nPatch - 20%\nNone - 20%',
    );
    expect(model.exactPackages[0].tooltipDetail).toBeUndefined();
    expect(model.unmatchedPackages[0].tooltipDetail).toBeUndefined();
  });

  it('leaves tooltipDetail undefined when percentages are absent', () => {
    const model = getEcosystemChartModel(makeReport());

    expect(model.partialPackages[0].tooltipDetail).toBeUndefined();
  });
});
