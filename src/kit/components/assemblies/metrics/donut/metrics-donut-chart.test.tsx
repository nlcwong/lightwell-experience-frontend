import { render, screen, within } from '@testing-library/react';

import { LwMetricsDonutChart } from './metrics-donut-chart';

const OUTER_DATA = [
  { x: 'Exact match', y: 60 },
  { x: 'Partial match', y: 15 },
  { x: 'No match', y: 25 },
];

it('renders the donut host with title and kit class', () => {
  const { container } = render(
    <LwMetricsDonutChart
      data={OUTER_DATA}
      width={320}
      height={280}
      title='75%'
      subTitle='packages matched'
      ariaDesc='Match summary donut chart'
    />,
  );

  expect(container.querySelector('.lw-c-metrics-donut-chart')).toBeTruthy();
  expect(screen.getByText('75%')).toBeInTheDocument();
});

it('renders a nested inner ring with more slices when innerData is provided', () => {
  const { container: plain } = render(
    <LwMetricsDonutChart data={OUTER_DATA} width={320} height={280} title='75%' />,
  );
  const plainSliceCount = plain.querySelectorAll('path').length;

  const { container: nested } = render(
    <LwMetricsDonutChart
      data={OUTER_DATA}
      width={320}
      height={280}
      title='75%'
      subTitle='packages matched'
      innerData={[
        { x: '', y: 60 },
        { x: 'Major', y: 5 },
        { x: 'Minor', y: 5 },
        { x: 'Patch', y: 3 },
        { x: 'Partial – none', y: 2 },
        { x: '', y: 25 },
      ]}
      innerColorScale={['transparent', 'a', 'b', 'c', 'd', 'transparent']}
    />,
  );

  // The nested ring adds its own slices on top of the outer ring's.
  expect(nested.querySelectorAll('path').length).toBeGreaterThan(plainSliceCount);
  // Center title still renders (moved to the inner ring).
  expect(within(nested).getByText('75%')).toBeInTheDocument();
});
