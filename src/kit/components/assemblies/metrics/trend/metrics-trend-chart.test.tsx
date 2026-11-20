import { render, screen } from '@testing-library/react';

import { LwMetricsTrendChart } from './metrics-trend-chart';

const categories = ['Jun', 'Jul', 'Aug'];

it('renders one legend entry per series with swatches', () => {
  const { container } = render(
    <LwMetricsTrendChart
      categories={categories}
      series={[{ id: 'shared', label: 'Shared packages', data: [1, 2, 3] }]}
      width={400}
      height={180}
    />,
  );

  expect(container.querySelector('.lw-c-metrics-trend-chart')).toBeTruthy();
  expect(screen.getByText('Shared packages')).toBeInTheDocument();
  expect(container.querySelectorAll('.lw-c-metrics-trend-chart__legend-item')).toHaveLength(1);
});

it('renders both legend entries for a stacked chart', () => {
  const { container } = render(
    <LwMetricsTrendChart
      categories={categories}
      series={[
        { id: 'yours', label: 'Your fixes', data: [1, 2, 3] },
        { id: 'others', label: "Other members' fixes", data: [4, 5, 6] },
      ]}
      totalLabel='Total fixes in the network'
      width={400}
      height={180}
    />,
  );

  expect(screen.getByText('Your fixes')).toBeInTheDocument();
  expect(screen.getByText("Other members' fixes")).toBeInTheDocument();
  expect(container.querySelectorAll('.lw-c-metrics-trend-chart__legend-item')).toHaveLength(2);
});

it('renders a screen-reader table derived from the series', () => {
  render(
    <LwMetricsTrendChart
      categories={categories}
      series={[{ id: 'shared', label: 'Shared packages', data: [1, 2, 3] }]}
      width={400}
      height={180}
      a11yTable={{ caption: 'Shared packages by month' }}
    />,
  );

  expect(screen.getByText('Shared packages by month')).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Shared packages' })).toBeInTheDocument();
  expect(screen.getByRole('rowheader', { name: 'Jul' })).toBeInTheDocument();
});
