import {
  selectIsConfiguratorOpen,
  selectSidebarSettings,
  setFixedNavbar,
  setSidenavType,
  toggleConfigurator,
} from "@/redux/features/configurator";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

export const useLayoutConfig = () => {
  const dispatch = useAppDispatch();
  const sidebarSettings = useAppSelector(selectSidebarSettings);
  const isConfiguratorOpen = useAppSelector(selectIsConfiguratorOpen);

  return {
    // State
    ...sidebarSettings,
    isConfiguratorOpen,

    // Actions
    toggleConfigurator: () => dispatch(toggleConfigurator()),
    setFixedNavbar: (fixed: boolean) => dispatch(setFixedNavbar(fixed)),
    setSidenavType: (type: "transparent" | "white") =>
      dispatch(setSidenavType(type)),
  };
};
