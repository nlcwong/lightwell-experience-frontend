import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DrawerActions,
  DrawerCloseButton,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
} from '@patternfly/react-core';

import { LwContent, LwLabel, LwList, LwTitle } from 'kit/components/primitives';
import type { CoverageReportPackage, MatchSegment } from 'services/Lightwell/CoverageReportsApi';

const PARTIAL_MATCH_DRAWER_TITLE_ID = 'lightwell-partial-match-drawer-title';

// Friendly explanation of how the nearest higher catalog version agrees with the
// user's version (LWLP-5925).
const MATCH_SEGMENT_DESCRIPTION: Record<MatchSegment, string> = {
  patch: 'Matches to the patch level — only the final version component differs.',
  minor: 'Matches to the minor level — same major and minor version, different patch.',
  major: 'Matches to the major level — only the major version agrees.',
  none: 'No shared version line with a higher catalog version.',
};

type PartialMatchDetailsPanelProps = {
  pkg: CoverageReportPackage;
  onClose: () => void;
};

const PartialMatchDetailsPanel = ({ pkg, onClose }: PartialMatchDetailsPanelProps) => {
  const availableVersions = pkg.lightwell_versions ?? [];
  const nearest = pkg.nearest_higher_version;
  const segment = pkg.match_segment ?? 'none';

  return (
    <DrawerPanelContent
      isResizable
      id='lightwell-partial-match-details-panel'
      minSize='380px'
      defaultSize='480px'
      widths={{ default: 'width_33' }}
      resizeAriaLabel='Resize partial match details drawer'
      focusTrap={{
        enabled: true,
        elementToFocusOnExpand: `#${PARTIAL_MATCH_DRAWER_TITLE_ID}`,
        'aria-labelledby': PARTIAL_MATCH_DRAWER_TITLE_ID,
      }}
    >
      <DrawerHead>
        <Flex
          spaceItems={{ default: 'spaceItemsSm' }}
          alignItems={{ default: 'alignItemsCenter' }}
          flexWrap={{ default: 'wrap' }}
        >
          <LwTitle id={PARTIAL_MATCH_DRAWER_TITLE_ID} tabIndex={-1} headingLevel='h2' size='lg'>
            {pkg.name}
          </LwTitle>
          <LwLabel isCompact color='grey' variant='outline'>
            {pkg.ecosystem}
          </LwLabel>
          <LwLabel isCompact color='yellow'>
            Partial
          </LwLabel>
        </Flex>
        <DrawerActions>
          <DrawerCloseButton onClose={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <DescriptionList isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Your version</DescriptionListTerm>
            <DescriptionListDescription>
              {pkg.version || 'No version specified'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Nearest higher version in Lightwell</DescriptionListTerm>
            <DescriptionListDescription>
              {nearest ? nearest : 'No higher version available in the catalog.'}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>How it compares</DescriptionListTerm>
            <DescriptionListDescription>
              {MATCH_SEGMENT_DESCRIPTION[segment]}
            </DescriptionListDescription>
          </DescriptionListGroup>

          <DescriptionListGroup>
            <DescriptionListTerm>Available in Lightwell</DescriptionListTerm>
            <DescriptionListDescription>
              {availableVersions.length > 0 ? (
                <LwList
                  isPlain
                  items={availableVersions.map((version) => ({ id: version, children: version }))}
                />
              ) : (
                <LwContent component='p'>No catalog versions found for this package.</LwContent>
              )}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );
};

export default PartialMatchDetailsPanel;
