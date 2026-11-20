import { render, screen } from '@testing-library/react';

import { BeaconTrendsPanel } from './BeaconTrendsPanel';
import { buildBeaconTrends } from '../trends';

const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

it('renders a titled, help-triggered chart for every metric plus the privacy note', () => {
  render(<BeaconTrendsPanel trends={buildBeaconTrends(months)} />);

  expect(
    screen.getByRole('heading', { name: 'Fixes in the Lightwell Network' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Shared Vulnerabilities' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Shared Packages' })).toBeInTheDocument();

  expect(
    screen.getByRole('button', { name: 'About Fixes in the Lightwell Network' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'About Shared Packages' })).toBeInTheDocument();

  expect(
    screen.getByText('Privacy-safe: only aggregate counts and overlap quantities are shown.'),
  ).toBeInTheDocument();
});
