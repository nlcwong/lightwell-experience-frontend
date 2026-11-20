import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';
import ChartBarIcon from '@patternfly/react-icons/dist/esm/icons/chart-bar-icon';

import { LwButton } from 'kit/components/primitives';

type BeaconTrendsCtaProps = {
  onClick: () => void;
};

/** Link CTA in the hero that opens the submission-trends drawer. */
export function BeaconTrendsCta({ onClick }: BeaconTrendsCtaProps) {
  return (
    <div className='lightwell-beacon-trends-cta'>
      <LwButton
        variant='link'
        size='lg'
        icon={<ChartBarIcon />}
        iconPosition='start'
        onClick={onClick}
      >
        <span className='lightwell-beacon-trends-cta__label'>
          View Beacon submission trends
          <AngleRightIcon />
        </span>
      </LwButton>
    </div>
  );
}
