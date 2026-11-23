import { Backdrop, Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import drawerStyles from '@patternfly/react-styles/css/components/Drawer/drawer';
import { type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { createUseStyles } from 'react-jss';

import type { CoverageReportPackage } from 'services/Lightwell/CoverageReportsApi';
import { useDrawerOverlay } from '../../hooks/useDrawerOverlay';
import PartialMatchDetailsPanel from './PartialMatchDetailsPanel';

const useStyles = createUseStyles({
  overlayDrawer: {
    position: 'absolute',
    inset: 0,
    height: '100%',
    pointerEvents: 'none',
    '& .pf-v6-c-drawer__panel': {
      pointerEvents: 'auto',
    },
  },
});

type PartialMatchDrawerProps = PropsWithChildren<{
  // The partial package whose details to show, or null when the drawer is closed.
  selected: CoverageReportPackage | null;
  onClose: () => void;
}>;

/**
 * Overlay drawer for a package's partial-match details. Mirrors the Packages
 * advisory drawer: the panel is portaled over the page via `useDrawerOverlay`,
 * with the table rendered as the drawer body.
 */
const PartialMatchDrawer = ({ selected, onClose, children }: PartialMatchDrawerProps) => {
  const classes = useStyles();
  const isExpanded = selected != null;

  const { isOverlayMounted, isOverlayExpanded, onOverlayTransitionEnd, onEscape } =
    useDrawerOverlay({
      isExpanded,
      onClose,
    });

  const panelContent = selected ? (
    <PartialMatchDetailsPanel pkg={selected} onClose={onClose} />
  ) : null;

  return (
    <Drawer isExpanded={isExpanded} onKeyDown={onEscape} isPill position='end'>
      <DrawerContent
        panelContent={
          isOverlayMounted
            ? createPortal(
                <Backdrop onClick={onClose}>
                  <div
                    className={`${drawerStyles.drawer} ${isOverlayExpanded ? drawerStyles.modifiers.expanded : ''} ${drawerStyles.modifiers.pill} ${classes.overlayDrawer}`}
                    onClick={(event) => event.stopPropagation()}
                    onTransitionEnd={onOverlayTransitionEnd}
                  >
                    <div className={drawerStyles.drawerMain}>
                      <div className={drawerStyles.drawerContent} />
                      {panelContent}
                    </div>
                  </div>
                </Backdrop>,
                document.body,
              )
            : panelContent
        }
      >
        <DrawerContentBody>{children}</DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};

export default PartialMatchDrawer;
