import type { CompletedCoverageReport } from 'services/Lightwell/CoverageReportsApi';
import type { ManifestUploadCardProps } from './Lens/components/ManifestUploadCard';

export const MOCK_REPORT: CompletedCoverageReport = {
  uuid: 'mock-report',
  status: 'completed',
  created_at: '2026-08-18T00:00:00Z',
  completed_at: '2026-08-18T00:00:01Z',
  total: 1830,
  skipped_entries: 3,
  exact_matches: 1100,
  partial_matches: 270,
  unmatched: 460,
  cve_summary: { critical: 23, important: 76, moderate: 27, low: 15 },
  ecosystem_coverage_summary: [
    {
      ecosystem: 'Python',
      supported: true,
      total: 400,
      exact_matches: 270,
      partial_matches: 70,
      unmatched: 60,
    },
    {
      ecosystem: 'Java',
      supported: true,
      total: 650,
      exact_matches: 450,
      partial_matches: 110,
      unmatched: 90,
    },
    {
      ecosystem: 'Go',
      supported: false,
      total: 150,
      exact_matches: 0,
      partial_matches: 0,
      unmatched: 150,
    },
    {
      ecosystem: 'C#',
      supported: false,
      total: 50,
      exact_matches: 0,
      partial_matches: 0,
      unmatched: 50,
    },
    {
      ecosystem: 'Rust',
      supported: false,
      total: 30,
      exact_matches: 0,
      partial_matches: 0,
      unmatched: 30,
    },
    {
      ecosystem: 'JavaScript',
      supported: true,
      total: 550,
      exact_matches: 380,
      partial_matches: 90,
      unmatched: 80,
    },
  ],
  // Per-ecosystem % breakdown (LWLP-6123). Within a supported ecosystem:
  // exact ↔ exact_matches, (major+minor+patch+none) ↔ partial_matches,
  // no_coverage ↔ unmatched. Unsupported ecosystems are 100% no_coverage.
  ecosystem_coverage_percentages: [
    {
      ecosystem: 'Python',
      exact: 67.5,
      major: 2.5,
      minor: 5.0,
      patch: 7.5,
      none: 2.5,
      no_coverage: 15.0,
    },
    {
      ecosystem: 'Java',
      exact: 69.2,
      major: 1.6,
      minor: 4.6,
      patch: 7.7,
      none: 3.1,
      no_coverage: 13.8,
    },
    { ecosystem: 'Go', exact: 0, major: 0, minor: 0, patch: 0, none: 0, no_coverage: 100 },
    { ecosystem: 'C#', exact: 0, major: 0, minor: 0, patch: 0, none: 0, no_coverage: 100 },
    { ecosystem: 'Rust', exact: 0, major: 0, minor: 0, patch: 0, none: 0, no_coverage: 100 },
    {
      ecosystem: 'JavaScript',
      exact: 69.1,
      major: 1.8,
      minor: 5.5,
      patch: 7.3,
      none: 1.8,
      no_coverage: 14.5,
    },
  ],
};

const mockUploadProps: ManifestUploadCardProps = {
  file: undefined,
  fileError: undefined,
  processError: undefined,
  step: 'select',
  reportUUID: '',
  onDropAccepted: () => undefined,
  onRetry: () => undefined,
};

export const MOCK_UPLOAD = {
  uploadProps: mockUploadProps,
};

export const MOCK_REPORT_VIEW = {
  filename: 'Vuln-Report_2026-08-18.csv',
  report: MOCK_REPORT,
  isLoading: false,
  isError: false,
  error: null,
  startOver: () => undefined,
};
