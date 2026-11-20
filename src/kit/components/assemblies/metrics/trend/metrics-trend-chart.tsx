import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLabel,
  ChartStack,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import type { CSSProperties, Ref } from 'react';

import { mergeClassNames } from 'kit/components/components.config';
import { lightwellConfig } from 'kit/lightwell.config';
import './metrics-trend-chart.css';

export type LwMetricsTrendSeries = {
  id: string;
  label: string;
  /** One value per `categories` entry, same order. */
  data: number[];
  /** Defaults to a `lightwellConfig.colors` entry by series position. */
  fill?: string;
};

export type LwMetricsTrendA11yTable = {
  caption: string;
};

export type LwMetricsTrendChartProps = {
  /** X labels (e.g. months), oldest first. */
  categories: string[];
  /** One series (single bars) or two (stacked, first is the lower layer). */
  series: [LwMetricsTrendSeries] | [LwMetricsTrendSeries, LwMetricsTrendSeries];
  width: number;
  height: number;
  /** Stacked only: adds a "label: sum" line to the tooltip. */
  totalLabel?: string;
  allowTooltip?: boolean;
  a11yTable?: LwMetricsTrendA11yTable;
  containerRef?: Ref<HTMLDivElement>;
  className?: string;
};

const DEFAULT_FILLS = [
  lightwellConfig.colors.stepIcon.blue,
  lightwellConfig.colors.matchStatus.none,
];
const PADDING = { left: 44, right: 12, top: 16, bottom: 40 };
const DOMAIN_PADDING = { x: 28, y: 8 };
const TOOLTIP_FONT_PX = 14;
const TOOLTIP_FONT = `${TOOLTIP_FONT_PX}px "Red Hat Text", RedHatText, sans-serif`;
const TOOLTIP_INSET = 14;
/** Fallback average glyph width (px) when canvas text measurement is unavailable (e.g. jsdom). */
const FALLBACK_CHAR_PX = 7.5;

let measureContext: CanvasRenderingContext2D | null | undefined;

const measureTextWidth = (text: string): number => {
  if (measureContext === undefined) {
    try {
      measureContext = document.createElement('canvas').getContext('2d');
    } catch {
      measureContext = null;
    }
    if (measureContext) measureContext.font = TOOLTIP_FONT;
  }
  return measureContext ? measureContext.measureText(text).width : text.length * FALLBACK_CHAR_PX;
};

const getSwatchStyle = (fill: string): CSSProperties => ({ backgroundColor: fill });

/** Widest line any tooltip can ever show, used to size the flyout up front. */
const widestTooltipLine = (
  categories: string[],
  series: LwMetricsTrendChartProps['series'],
  totalLabel?: string,
): number => {
  const [lower, upper] = series;
  const lines = categories.flatMap((month, i) => {
    const out = [month, `${lower.label}: ${lower.data[i]}`];
    if (upper) {
      out.push(`${upper.label}: ${upper.data[i]}`);
      if (totalLabel) out.push(`${totalLabel}: ${lower.data[i] + upper.data[i]}`);
    }
    return out;
  });
  return Math.max(0, ...lines.map(measureTextWidth));
};

/**
 * Kit **assembly** — PF monthly bar trend harness (1 series, or 2 stacked).
 * Call site owns data, month window, copy (title / help popover), and sizing.
 */
export function LwMetricsTrendChart({
  categories,
  series,
  width,
  height,
  totalLabel,
  allowTooltip = true,
  a11yTable,
  containerRef,
  className,
}: LwMetricsTrendChartProps) {
  const [lower, upper] = series;
  const fills = series.map((layer, i) => layer.fill ?? DEFAULT_FILLS[i]);
  const flyoutWidth = Math.ceil(
    widestTooltipLine(categories, series, totalLabel) + TOOLTIP_INSET * 2,
  );

  const toData = (values: number[]) => values.map((y, i) => ({ x: categories[i], y }));

  // Voronoi groups by x and calls this per bar at that x; results join with newlines.
  // Lower (or single) bar leads with the month; upper bar adds its line and the total.
  const labelFor = ({ datum }: { datum: { childName?: string; x: string; y: number } }) => {
    if (datum.childName !== 'lw-trend-upper' || !upper) {
      return `${datum.x}\n${lower.label}: ${datum.y}`;
    }
    const lowerY = lower.data[categories.indexOf(datum.x)] ?? 0;
    const base = `${upper.label}: ${datum.y}`;
    return totalLabel ? `${base}\n${totalLabel}: ${datum.y + lowerY}` : base;
  };

  const containerComponent = allowTooltip ? (
    <ChartVoronoiContainer
      voronoiDimension='x'
      constrainToVisibleArea
      labels={labelFor}
      labelComponent={
        <ChartTooltip
          flyoutWidth={flyoutWidth}
          labelComponent={<ChartLabel textAnchor='start' dx={-flyoutWidth / 2 + TOOLTIP_INSET} />}
        />
      }
    />
  ) : undefined;

  return (
    <div className={mergeClassNames('lw-c-metrics-trend-chart', className)}>
      <div ref={containerRef} className='lw-c-metrics-trend-chart__plot'>
        <Chart
          width={width}
          height={height}
          padding={PADDING}
          domainPadding={DOMAIN_PADDING}
          containerComponent={containerComponent}
        >
          <ChartAxis />
          <ChartAxis dependentAxis showGrid tickFormat={(tick: number) => `${Math.round(tick)}`} />
          <ChartStack>
            {series.map((layer, i) => (
              <ChartBar
                key={layer.id}
                name={i === 0 ? 'lw-trend-lower' : 'lw-trend-upper'}
                data={toData(layer.data)}
                style={{ data: { fill: fills[i] } }}
              />
            ))}
          </ChartStack>
        </Chart>
      </div>
      <ul className='lw-c-metrics-trend-chart__legend'>
        {series.map((layer, i) => (
          <li key={layer.id} className='lw-c-metrics-trend-chart__legend-item'>
            <span className='lw-c-metrics-trend-chart__swatch' style={getSwatchStyle(fills[i])} />
            {layer.label}
          </li>
        ))}
      </ul>
      {a11yTable != null ? (
        <div className='pf-v6-screen-reader'>
          <table>
            <caption>{a11yTable.caption}</caption>
            <thead>
              <tr>
                <th scope='col'>Period</th>
                {series.map((layer) => (
                  <th key={layer.id} scope='col'>
                    {layer.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, i) => (
                <tr key={category}>
                  <th scope='row'>{category}</th>
                  {series.map((layer) => (
                    <td key={layer.id}>{layer.data[i]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export default LwMetricsTrendChart;
