import { chart_color_purple_100 } from '@patternfly/react-tokens/dist/esm/chart_color_purple_100';
import { chart_color_purple_300 } from '@patternfly/react-tokens/dist/esm/chart_color_purple_300';
import { chart_donut_label_subtitle_Fill } from '@patternfly/react-tokens/dist/esm/chart_donut_label_subtitle_Fill';
import { chart_donut_label_title_Fill } from '@patternfly/react-tokens/dist/esm/chart_donut_label_title_Fill';
import { chart_global_FontSize_2xl } from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_2xl';
import { chart_global_FontSize_sm } from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_sm';
import { t_chart_color_yellow_100 } from '@patternfly/react-tokens/dist/esm/t_chart_color_yellow_100';
import { t_chart_color_yellow_200 } from '@patternfly/react-tokens/dist/esm/t_chart_color_yellow_200';
import { t_chart_color_yellow_300 } from '@patternfly/react-tokens/dist/esm/t_chart_color_yellow_300';
import { t_chart_color_yellow_400 } from '@patternfly/react-tokens/dist/esm/t_chart_color_yellow_400';
import { t_global_border_color_nonstatus_gray_default } from '@patternfly/react-tokens/dist/esm/t_global_border_color_nonstatus_gray_default';
import { t_global_border_color_nonstatus_green_default } from '@patternfly/react-tokens/dist/esm/t_global_border_color_nonstatus_green_default';
import { t_global_border_color_nonstatus_yellow_default } from '@patternfly/react-tokens/dist/esm/t_global_border_color_nonstatus_yellow_default';
import { t_global_font_weight_body_default } from '@patternfly/react-tokens/dist/esm/t_global_font_weight_body_default';
import type { CSSProperties } from 'react';

import type { CoverageMatchStatus } from 'services/Lightwell/CoverageReportsApi';
import { LIGHTWELL_ECOSYSTEM_KEY_BY_LABEL } from '../utils/ecosystem';

// Shared

// Label chip family (nonstatus). Border tokens read stronger in light; match fills in dark.
// Partial is yellow (not orange) so it does not collide with Java brand bars.
export const MATCH_STATUS_COLORS = {
  exact: t_global_border_color_nonstatus_green_default.var,
  partial: t_global_border_color_nonstatus_yellow_default.var,
  none: t_global_border_color_nonstatus_gray_default.var,
} as const;

export const UNMATCHED_FILL = MATCH_STATUS_COLORS.none;

export type MatchStatusColorKey = keyof typeof MATCH_STATUS_COLORS;

// Partial-match sub-level scale for the donut's nested inner ring: a single-hue
// amber→gold ramp from PF's current chart-yellow tokens (`--pf-t--chart--color--
// yellow--*`). In this family lightness goes 100 = light (#dca614) → 400 = dark
// (#73480b), so Patch = 400 (dark, closest match) fades to None = 100 (gold, loosest).
export const PARTIAL_LEVEL_COLORS = {
  patch: t_chart_color_yellow_400.var, // #73480b dark amber (closest match)
  minor: t_chart_color_yellow_300.var, // #96640f
  major: t_chart_color_yellow_200.var, // #b98412
  none: t_chart_color_yellow_100.var, // #dca614 gold (loosest)
} as const;

export type PartialLevelColorKey = keyof typeof PARTIAL_LEVEL_COLORS;

// Bar chart

export const ECOSYSTEM_BAR_LEGEND_SWATCH_SIZE = 12;
export const ECOSYSTEM_CHART_MIN_WIDTH = 500;
export const ECOSYSTEM_CHART_PADDING = { bottom: 65, left: 100, right: 20, top: 10 };
export const ECOSYSTEM_CHART_DOMAIN_PADDING = { x: [15, 15] as [number, number] };

export const CATEGORY_AXIS_STYLE = { tickLabels: { fontSize: 14 } };
export const COUNT_AXIS_STYLE = {
  tickLabels: { fontSize: 14 },
  axisLabel: { fontSize: 14, padding: 50 },
};

// Applied to unknown ecosystems with no backend mapping (no token is defined for them in LIGHTWELL_ECOSYSTEMS):
// https://github.com/content-services/content-sources-backend/blob/fea90711c14c715cae6ad9b13cfb397e3d2807a2/pkg/coverage/parser/parser.go#L11
const ECOSYSTEM_BAR_FALLBACK_COLORS = {
  exact: chart_color_purple_300.var,
  partial: chart_color_purple_100.var,
};

export const getEcosystemMatchColor = (
  ecosystem: string,
  matchStatus: Exclude<CoverageMatchStatus, 'none'>,
): string => {
  const key = LIGHTWELL_ECOSYSTEM_KEY_BY_LABEL.get(ecosystem);
  if (!key) return ECOSYSTEM_BAR_FALLBACK_COLORS[matchStatus];
  return `var(--lw-color-${key}-${matchStatus})`;
};

// Donut chart

export const DONUT_COLOR_SCALE = [
  MATCH_STATUS_COLORS.exact,
  MATCH_STATUS_COLORS.partial,
  MATCH_STATUS_COLORS.none,
];

export const DONUT_TITLE_AND_SUBTITLE_STYLE: CSSProperties[] = [
  {
    fill: chart_donut_label_title_Fill.var,
    fontSize: chart_global_FontSize_2xl.value,
    fontWeight: t_global_font_weight_body_default.var,
  },
  {
    fill: chart_donut_label_subtitle_Fill.var,
    fontSize: chart_global_FontSize_sm.value,
  },
];
