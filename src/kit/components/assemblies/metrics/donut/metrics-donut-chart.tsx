import { ChartContainer, ChartDonut, ChartLabel } from '@patternfly/react-charts/victory';
import { chart_donut_label_subtitle_Fill } from '@patternfly/react-tokens/dist/esm/chart_donut_label_subtitle_Fill';
import { chart_donut_label_title_Fill } from '@patternfly/react-tokens/dist/esm/chart_donut_label_title_Fill';
import { chart_global_FontSize_sm } from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_sm';
import { chart_global_FontSize_xs } from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_xs';
import { t_global_font_weight_heading_bold } from '@patternfly/react-tokens/dist/esm/t_global_font_weight_heading_bold';
import type { CSSProperties, Ref } from 'react';

import { mergeClassNames } from 'kit/components/components.config';
import { lightwellConfig } from 'kit/lightwell.config';
import './metrics-donut-chart.css';

export type LwMetricsDonutDatum = {
  x: string;
  y: number;
};

const DEFAULT_PADDING = { bottom: 10, left: 10, right: 10, top: 10 };
const DEFAULT_TITLE_LINE_HEIGHT = 1.6;
// PF draws a 9px band when innerRadius is omitted. This share of the outer radius is the ring.
const RING_THICKNESS_RATIO = 0.14;
// Radial gap (px) between the outer ring's inner edge and the inner ring's outer edge.
const NESTED_RING_GAP = 6;

const getOuterRadius = (
  width: number,
  height: number,
  padding: { bottom?: number; left?: number; right?: number; top?: number },
): number =>
  Math.min(
    width - (padding.left ?? 0) - (padding.right ?? 0),
    height - (padding.top ?? 0) - (padding.bottom ?? 0),
  ) / 2;

const getInnerRadius = (
  width: number,
  height: number,
  padding: { bottom?: number; left?: number; right?: number; top?: number },
): number => getOuterRadius(width, height, padding) * (1 - RING_THICKNESS_RATIO);

const DEFAULT_TITLE_STYLE: CSSProperties[] = [
  {
    fill: chart_donut_label_title_Fill.var,
    fontSize: chart_global_FontSize_xs.value * 3,
    fontWeight: t_global_font_weight_heading_bold.var,
  },
  {
    fill: chart_donut_label_subtitle_Fill.var,
    fontSize: chart_global_FontSize_sm.value,
  },
];

const DEFAULT_COLOR_SCALE = [
  lightwellConfig.colors.matchStatus.exact,
  lightwellConfig.colors.matchStatus.partial,
  lightwellConfig.colors.matchStatus.none,
];

export type LwMetricsDonutChartProps = {
  data: LwMetricsDonutDatum[];
  width: number;
  height: number;
  title: string;
  subTitle?: string;
  colorScale?: string[];
  ariaDesc?: string;
  allowTooltip?: boolean;
  getLabel?: (args: { datum: LwMetricsDonutDatum }) => string;
  /** Optional nested inner ring (e.g. a drill-down of one outer slice). */
  innerData?: LwMetricsDonutDatum[];
  innerColorScale?: string[];
  innerGetLabel?: (args: { datum: LwMetricsDonutDatum }) => string | null;
  innerAriaDesc?: string;
  containerRef?: Ref<HTMLDivElement>;
  padding?: { bottom?: number; left?: number; right?: number; top?: number };
  className?: string;
};

/**
 * Kit **assembly** — PF `ChartDonut` harness for match / utilization metrics.
 * Call site owns series builders and resize measurement. When `innerData` is set,
 * a second concentric ring is nested inside the main one (shared center/SVG); the
 * center title/subtitle move to the inner ring and both rings use `padAngle={0}`
 * so a caller can align inner segments under an outer slice via transparent padding.
 */
export function LwMetricsDonutChart({
  data,
  width,
  height,
  title,
  subTitle,
  colorScale = DEFAULT_COLOR_SCALE,
  ariaDesc = 'Donut chart',
  allowTooltip = true,
  getLabel,
  innerData,
  innerColorScale,
  innerGetLabel,
  innerAriaDesc = 'Nested donut chart',
  containerRef,
  padding = DEFAULT_PADDING,
  className,
}: LwMetricsDonutChartProps) {
  const hasInnerRing = innerData != null && innerData.length > 0;

  const outerDonut = (
    <ChartDonut
      ariaDesc={ariaDesc}
      constrainToVisibleArea
      standalone={!hasInnerRing}
      data={data}
      colorScale={colorScale}
      allowTooltip={allowTooltip}
      labels={allowTooltip && getLabel ? getLabel : undefined}
      padAngle={0}
      // Center labels move to the inner ring when nested.
      title={hasInnerRing ? undefined : title}
      subTitle={hasInnerRing ? undefined : subTitle}
      titleComponent={
        <ChartLabel lineHeight={DEFAULT_TITLE_LINE_HEIGHT} style={DEFAULT_TITLE_STYLE} />
      }
      width={width}
      height={height}
      padding={padding}
      innerRadius={getInnerRadius(width, height, padding)}
    />
  );

  let chart = outerDonut;

  if (hasInnerRing) {
    const innerOuterRadius = Math.max(getInnerRadius(width, height, padding) - NESTED_RING_GAP, 1);
    const innerInnerRadius = innerOuterRadius * (1 - RING_THICKNESS_RATIO);

    chart = (
      <ChartContainer width={width} height={height}>
        {outerDonut}
        <ChartDonut
          ariaDesc={innerAriaDesc}
          constrainToVisibleArea
          standalone={false}
          data={innerData}
          colorScale={innerColorScale}
          allowTooltip={allowTooltip}
          labels={allowTooltip && innerGetLabel ? innerGetLabel : undefined}
          padAngle={0}
          title={title}
          subTitle={subTitle}
          titleComponent={
            <ChartLabel lineHeight={DEFAULT_TITLE_LINE_HEIGHT} style={DEFAULT_TITLE_STYLE} />
          }
          width={width}
          height={height}
          padding={padding}
          radius={innerOuterRadius}
          innerRadius={innerInnerRadius}
        />
      </ChartContainer>
    );
  }

  return (
    <div ref={containerRef} className={mergeClassNames('lw-c-metrics-donut-chart', className)}>
      {chart}
    </div>
  );
}

export default LwMetricsDonutChart;
