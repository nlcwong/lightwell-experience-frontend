import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PackageCoverageTable from './PackageCoverageTable';
import { usePackageCoverageTable } from '../hooks/usePackageCoverageTable';
import { useCoverageReportPackagesQuery } from 'services/Lightwell/CoverageReportsQueries';
import { defaultCoverageReportPackagesItem, ReactQueryTestWrapper } from 'testingHelpers';
import type { EcosystemInfo } from '../utils/ecosystem';
import type { CoverageReportPackage } from 'services/Lightwell/CoverageReportsApi';

const mockPackagesData = (packages: CoverageReportPackage[]) =>
  (useCoverageReportPackagesQuery as jest.Mock).mockImplementation(() => ({
    isLoading: false,
    isFetching: false,
    isError: false,
    data: { data: packages, meta: { count: packages.length, limit: 20, offset: 0 } },
  }));

const partialWithDetail: CoverageReportPackage = {
  name: 'netty-codec-http',
  version: '4.1.86.Final',
  ecosystem: 'Java',
  covered: true,
  match_status: 'partial',
  cve_count: { critical: 0, important: 0, moderate: 0, low: 0 },
  lightwell_versions: ['4.1.9.Final', '4.1.86.Final', '4.1.108.Final'],
  nearest_higher_version: '4.1.108.Final',
  match_segment: 'minor',
};

jest.mock('services/Lightwell/CoverageReportsQueries', () => ({
  ...jest.requireActual('services/Lightwell/CoverageReportsQueries'),
  useCoverageReportPackagesQuery: jest.fn(),
}));

jest.mock('Pages/Lightwell/constants', () => ({
  ...jest.requireActual('Pages/Lightwell/constants'),
  LIGHTWELL_LENS_USE_MOCK: false,
}));

const PackageCoverageTableHarness = ({
  ecosystems,
  showCveColumns = true,
}: {
  ecosystems: EcosystemInfo[];
  showCveColumns?: boolean;
}) => {
  const table = usePackageCoverageTable(ecosystems);
  return (
    <PackageCoverageTable
      uuid='test-uuid'
      ecosystems={ecosystems}
      table={table}
      showCveColumns={showCveColumns}
    />
  );
};

const DEFAULT_ECOSYSTEMS: EcosystemInfo[] = [
  { name: 'Java', supported: true },
  { name: 'Python', supported: true },
  { name: 'JavaScript', supported: true },
];

const renderTable = (ecosystems: EcosystemInfo[] = DEFAULT_ECOSYSTEMS, showCveColumns = true) =>
  render(
    <ReactQueryTestWrapper>
      <PackageCoverageTableHarness ecosystems={ecosystems} showCveColumns={showCveColumns} />
    </ReactQueryTestWrapper>,
  );

describe('PackageCoverageTable', () => {
  beforeEach(() => {
    (useCoverageReportPackagesQuery as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      isFetching: false,
      isError: false,
      data: {
        data: defaultCoverageReportPackagesItem,
        meta: { count: 3, limit: 20, offset: 0 },
      },
    }));
  });

  it('renders package rows with name, version, ecosystem, and match status labels', () => {
    renderTable();

    expect(screen.getByText('spring-web')).toBeInTheDocument();
    expect(screen.getByText('flask')).toBeInTheDocument();
    expect(screen.getByText('lodash')).toBeInTheDocument();

    expect(screen.getByText('6.1.5')).toBeInTheDocument();
    expect(screen.getByText('3.0.3')).toBeInTheDocument();
    expect(screen.getByText('4.17.21')).toBeInTheDocument();

    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();

    expect(screen.getByText('Exact')).toBeInTheDocument();
    expect(screen.getByText('Partial')).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('labels unsupported ecosystems in package rows', () => {
    renderTable([
      { name: 'Java', supported: true },
      { name: 'Python', supported: true },
      { name: 'JavaScript', supported: false },
    ]);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Unsupported')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    renderTable();

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(6);
    expect(headers[0]).toHaveTextContent('Package');
    expect(headers[1]).toHaveTextContent('Version');
    expect(headers[2]).toHaveTextContent('Ecosystem');
    expect(headers[3]).toHaveTextContent('Match');
    expect(headers[4]).toHaveTextContent('CVE Fixes (net delta)');
    expect(headers[5]).toHaveTextContent('CVSS Scores');
  });

  it('renders CVE fix counts and CVSS score ranges', () => {
    renderTable();

    // spring-web: critical 2, important 3, moderate 1, no low; range 5.4–9.8
    const springRow = screen.getByText('spring-web').closest('tr')!;
    expect(within(springRow).getByText('2')).toBeInTheDocument();
    expect(within(springRow).getByText('3')).toBeInTheDocument();
    expect(within(springRow).getByText('1')).toBeInTheDocument();
    expect(within(springRow).getByText('5.4–9.8')).toBeInTheDocument();

    // lodash has no CVEs: both columns show an em dash
    const lodashRow = screen.getByText('lodash').closest('tr')!;
    expect(within(lodashRow).getAllByText('—')).toHaveLength(2);
  });

  it('hides the CVE columns when the report has no CVE data', () => {
    renderTable(DEFAULT_ECOSYSTEMS, false);

    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    expect(screen.queryByText('CVE Fixes (net delta)')).not.toBeInTheDocument();
    expect(screen.queryByText('CVSS Scores')).not.toBeInTheDocument();

    // The CVSS range that would appear in the dropped column is gone too.
    expect(screen.queryByText('5.4–9.8')).not.toBeInTheDocument();
  });

  it('shows empty state when no packages are returned', () => {
    (useCoverageReportPackagesQuery as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      isFetching: false,
      isError: false,
      data: {
        data: [],
        meta: { count: 0, limit: 20, offset: 0 },
      },
    }));

    renderTable();
    expect(screen.getByText('No packages were found in this manifest.')).toBeInTheDocument();
  });

  it('shows error state on query error', () => {
    (useCoverageReportPackagesQuery as jest.Mock).mockImplementation(() => ({
      isLoading: false,
      isFetching: false,
      isError: true,
    }));

    renderTable();
    expect(screen.getByText('Unable to load packages')).toBeInTheDocument();
  });

  it('renders filter controls for search, match, and ecosystem', async () => {
    const user = userEvent.setup();
    renderTable();

    expect(screen.getByPlaceholderText('Search packages...')).toBeInTheDocument();

    const filterCategoryToggle = screen.getByRole('button', { name: 'Package' });
    await user.click(filterCategoryToggle);

    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Package' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Match' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Ecosystem' })).toBeInTheDocument();
  });

  describe('partial-match drawer', () => {
    it('opens the drawer with match detail when a partial package name is clicked', async () => {
      const user = userEvent.setup();
      mockPackagesData([partialWithDetail]);
      renderTable();

      await user.click(screen.getByRole('button', { name: 'netty-codec-http' }));

      // Panel heading (distinct from the trigger button).
      expect(screen.getByRole('heading', { name: 'netty-codec-http' })).toBeInTheDocument();
      expect(screen.getByText('Nearest higher version in Lightwell')).toBeInTheDocument();
      // Appears as both the nearest version and in the available list.
      expect(screen.getAllByText('4.1.108.Final').length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText(
          'Matches to the minor level — same major and minor version, different patch.',
        ),
      ).toBeInTheDocument();
      // A catalog version only present in the drawer list.
      expect(screen.getByText('4.1.9.Final')).toBeInTheDocument();
    });

    it('shows the no-higher-version line but still lists catalog versions when nearest is empty', async () => {
      const user = userEvent.setup();
      mockPackagesData([
        {
          ...partialWithDetail,
          name: 'jest',
          version: '29.7.0',
          nearest_higher_version: '',
          match_segment: 'none',
          lightwell_versions: ['29.7.0.0'],
        },
      ]);
      renderTable();

      await user.click(screen.getByRole('button', { name: 'jest' }));

      expect(screen.getByText('No higher version available in the catalog.')).toBeInTheDocument();
      expect(
        screen.getByText('No shared version line with a higher catalog version.'),
      ).toBeInTheDocument();
      expect(screen.getByText('29.7.0.0')).toBeInTheDocument();
    });

    it('does not make non-partial package names clickable', () => {
      mockPackagesData([
        {
          name: 'spring-web',
          version: '6.1.5',
          ecosystem: 'Java',
          covered: true,
          match_status: 'exact',
          cve_count: { critical: 0, important: 0, moderate: 0, low: 0 },
        },
      ]);
      renderTable();

      expect(screen.queryByRole('button', { name: 'spring-web' })).not.toBeInTheDocument();
      expect(screen.getByText('spring-web')).toBeInTheDocument();
    });

    it('closes the drawer', async () => {
      const user = userEvent.setup();
      mockPackagesData([partialWithDetail]);
      renderTable();

      await user.click(screen.getByRole('button', { name: 'netty-codec-http' }));
      expect(screen.getByRole('heading', { name: 'netty-codec-http' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(screen.queryByRole('heading', { name: 'netty-codec-http' })).not.toBeInTheDocument();
    });
  });
});
