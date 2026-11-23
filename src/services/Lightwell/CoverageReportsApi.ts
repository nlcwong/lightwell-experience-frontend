import axios from 'axios';
import { objectToUrlParams } from 'helpers';
import type { Links, Meta } from './types';

export type EcosystemCoverageSummary = {
  ecosystem: string;
  supported: boolean;
  exact_matches: number;
  partial_matches: number;
  unmatched: number;
  total: number;
};

// Per-ecosystem match breakdown as percentages within that ecosystem (sum ~100).
// The partial-match sub-levels are major/minor/patch/none; exact and no_coverage
// sit outside the partial breakdown. See LWLP-6123.
export type EcosystemCoveragePercentages = {
  ecosystem: string;
  exact: number;
  major: number;
  minor: number;
  patch: number;
  none: number;
  no_coverage: number;
};

export type CoverageMatchStatus = 'exact' | 'partial' | 'none';

// How the nearest higher catalog version agrees with the user's version (LWLP-5925).
export type MatchSegment = 'none' | 'major' | 'minor' | 'patch';

// Count of CVEs fixed in remediated repos, bucketed by severity.
export type CveCount = {
  critical: number;
  important: number;
  moderate: number;
  low: number;
};

// Min/max CVSS severity scores across a package's CVEs.
export type CveRange = {
  low: number;
  high: number;
};

export type CoverageReportPackage = {
  name: string;
  version: string;
  ecosystem: string;
  covered: boolean;
  match_status: CoverageMatchStatus;
  cve_count: CveCount;
  // Omitted by the backend when the package has no CVEs.
  cve_range?: CveRange;
  // Partial-match detail (LWLP-5925); optional for older backends.
  // - lightwell_versions: catalog versions for this package (populated for exact
  //   and partial; empty when match_status is 'none').
  // - nearest_higher_version: smallest catalog version strictly above the user's
  //   version; empty when exact, no manifest version, or nothing is higher.
  // - match_segment: how nearest_higher_version agrees with the user's version.
  lightwell_versions?: string[];
  nearest_higher_version?: string;
  match_segment?: MatchSegment;
};

export type CoverageReportPackagesListResponse = {
  data: CoverageReportPackage[];
  links: Links;
  meta: Meta;
};

export type CoverageReportPackageFilters = {
  search?: string;
  match_status?: string[];
  ecosystem?: string[];
};

type CoverageReportBase = {
  uuid: string;
  created_at: string;
  input_format?: string;
  analysis_task_uuid?: string;
};

type PendingCoverageReport = CoverageReportBase & {
  status: 'pending';
};

export type CompletedCoverageReport = CoverageReportBase & {
  status: 'completed';
  // Parser entries skipped due to invalid input; absent on older backends.
  skipped_entries?: number;
  exact_matches: number;
  partial_matches: number;
  unmatched: number;
  total: number;
  ecosystem_coverage_summary: EcosystemCoverageSummary[];
  // Per-ecosystem percentage breakdown; optional for older backends (LWLP-6123).
  ecosystem_coverage_percentages?: EcosystemCoveragePercentages[];
  cve_summary: CveCount;
  completed_at: string;
};

type FailedCoverageReport = CoverageReportBase & {
  status: 'failed';
  analysis_task_error?: string;
};

export type CoverageReportResponse =
  PendingCoverageReport | CompletedCoverageReport | FailedCoverageReport;

export const createCoverageReport = async (
  file: File,
  catalog_source?: string,
): Promise<CoverageReportResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (catalog_source) {
    formData.append('catalog_source', catalog_source);
  }

  const { data } = await axios.post<CoverageReportResponse>(
    '/api/content-sources/v1/coverage_reports/',
    formData,
  );
  return data;
};

export const getCoverageReport = async (uuid: string): Promise<CoverageReportResponse> => {
  const { data } = await axios.get<CoverageReportResponse>(
    `/api/content-sources/v1/coverage_reports/${encodeURIComponent(uuid)}`,
  );
  return data;
};

export const getCoverageReportPackages = async (
  uuid: string,
  page: number,
  limit: number,
  filters: CoverageReportPackageFilters = {},
): Promise<CoverageReportPackagesListResponse> => {
  const { data } = await axios.get<CoverageReportPackagesListResponse>(
    `/api/content-sources/v1/coverage_reports/${encodeURIComponent(uuid)}/packages?${objectToUrlParams(
      {
        offset: ((page - 1) * limit).toString(),
        limit: limit.toString(),
        search: filters.search,
        match_status: filters.match_status?.join(','),
        // objectToUrlParams does not escape #, so ecosystem=C# never reached the backend
        ecosystem: filters.ecosystem?.map(encodeURIComponent).join(','),
      },
    )}`,
  );
  return data;
};
