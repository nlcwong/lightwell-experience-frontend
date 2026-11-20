import { buildBeaconTrends, getRollingMonths } from './trends';

describe('getRollingMonths', () => {
  it('returns the requested count of months, oldest first, ending on now', () => {
    const now = new Date(2026, 10, 15); // Nov 2026
    expect(getRollingMonths(6, now)).toEqual(['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov']);
  });

  it('crosses the year boundary correctly', () => {
    const now = new Date(2026, 1, 1); // Feb 2026
    expect(getRollingMonths(4, now)).toEqual(['Nov', 'Dec', 'Jan', 'Feb']);
  });
});

describe('buildBeaconTrends', () => {
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const trends = buildBeaconTrends(months);

  it('exposes three metrics over the given window', () => {
    expect(trends.months).toBe(months);
    expect(trends.metrics.map((m) => m.id)).toEqual([
      'network-fixes',
      'shared-vulnerabilities',
      'shared-packages',
    ]);
  });

  it('gives the network-fixes metric two series and a total label', () => {
    const fixes = trends.metrics[0];
    expect(fixes.series).toHaveLength(2);
    expect(fixes.totalLabel).toBe('Total fixes in the network');
  });

  it('gives the shared metrics a single series', () => {
    expect(trends.metrics[1].series).toHaveLength(1);
    expect(trends.metrics[2].series).toHaveLength(1);
  });

  it('produces one data point per month for every series', () => {
    for (const metric of trends.metrics) {
      for (const series of metric.series) {
        expect(series.data).toHaveLength(months.length);
      }
    }
  });
});
