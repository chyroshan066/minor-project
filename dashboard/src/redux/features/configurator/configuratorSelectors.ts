import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export const selectConfigurator = (state: RootState) => state.configurator;

export const selectIsConfiguratorOpen = createSelector(
  [selectConfigurator],
  (configurator) => configurator.isOpen
);

export const selectSidebarSettings = createSelector(
  [selectConfigurator],
  (configurator) => ({
    sidenavType: configurator.sidenavType,
    fixedNavbar: configurator.fixedNavbar,
  })
);
