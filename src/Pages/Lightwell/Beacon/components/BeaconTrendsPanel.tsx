import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';

import { LwMetricsTrendChart } from 'kit/components/assemblies';
import { LwButton, LwContent, LwPopover, LwTitle } from 'kit/components/primitives';

import type { BeaconTrends } from '../trends';

const CHART_WIDTH = 400;
const CHART_HEIGHT = 180;

type BeaconTrendsPanelProps = {
  trends: BeaconTrends;
};

/**
 * Body of the Beacon "submission trends" drawer: a short intro, one trend chart
 * per metric (title + help popover composed above each chart, per the kit rule),
 * and a privacy note. Pure presentation — data comes from `useBeaconTrends`.
 */
export function BeaconTrendsPanel({ trends }: BeaconTrendsPanelProps) {
  return (
    <div className='lightwell-beacon-trends'>
      <LwContent component='p' className='lightwell-beacon-trends__intro'>
        <strong>Cumulative trends since July</strong>
        <br />
        Your shared activity vs other members (quantitative data only)
        <br />
        <span className='lightwell-beacon-trends__privacy'>
          <InfoCircleIcon className='lightwell-beacon-trends__privacy-icon' />
          Privacy-safe: only aggregate counts and overlap quantities are shown.
        </span>
      </LwContent>

      {trends.metrics.map((metric) => (
        <section key={metric.id} className='lightwell-beacon-trends__metric'>
          <div className='lightwell-beacon-trends__titlerow'>
            <LwTitle headingLevel='h3' size='md'>
              {metric.title}
            </LwTitle>
            <LwPopover
              hasHeader={metric.title}
              hasBody={metric.help}
              hasTrigger={
                <LwButton isCircle variant='plain' aria-label={`About ${metric.title}`}>
                  <HelpIcon />
                </LwButton>
              }
            />
          </div>
          <LwMetricsTrendChart
            categories={trends.months}
            series={metric.series}
            totalLabel={metric.totalLabel}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            a11yTable={{ caption: `${metric.title} by month` }}
          />
        </section>
      ))}
    </div>
  );
}
