import { render, screen } from '@testing-library/react';

import { LwMetricsStackChart, buildBarTooltipLabel } from './metrics-stack-chart';

it('renders the stack host and screen-reader table', () => {
  const { container } = render(
    <LwMetricsStackChart
      series={[
        {
          id: 'exact',
          label: 'Exact match',
          data: [{ x: 'maven', y: 10, fill: 'green', supported: true }],
        },
        {
          id: 'partial',
          label: 'Partial match',
          data: [{ x: 'maven', y: 2, fill: 'orange', supported: true }],
        },
      ]}
      width={500}
      height={200}
      a11yTable={{
        caption: 'Package matches by ecosystem',
        columns: ['Exact match', 'Partial match'],
        rows: [{ rowHeader: 'Maven', values: [10, 2] }],
      }}
    />,
  );

  expect(container.querySelector('.lw-c-metrics-stack-chart')).toBeTruthy();
  expect(screen.getByText('Package matches by ecosystem')).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Exact match' })).toBeInTheDocument();
});

describe('buildBarTooltipLabel', () => {
  it('returns the base label when no tooltipDetail is set', () => {
    expect(buildBarTooltipLabel('Partial match', { x: 'Java', y: 3, fill: 'yellow' })).toBe(
      'Partial match: 3 packages',
    );
  });

  it('appends tooltipDetail on a new line', () => {
    expect(
      buildBarTooltipLabel('Partial match', {
        x: 'Java',
        y: 3,
        fill: 'yellow',
        tooltipDetail: 'Major 0% · Minor 20% · Patch 20% · None 20% · Total 60%',
      }),
    ).toBe('Partial match: 3 packages\nMajor 0% · Minor 20% · Patch 20% · None 20% · Total 60%');
  });

  it('notes an unsupported ecosystem', () => {
    expect(
      buildBarTooltipLabel('No match', { x: 'Go', y: 5, fill: 'grey', supported: false }),
    ).toBe('No match: 5 packages (ecosystem unsupported)');
  });

  it('returns null for an empty bar', () => {
    expect(
      buildBarTooltipLabel('Partial match', {
        x: 'Java',
        y: 0,
        fill: 'yellow',
        tooltipDetail: 'x',
      }),
    ).toBeNull();
  });
});
