import { BaseTab } from "@/types/tabs";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseTabsOptions<T extends BaseTab> {
  initialTab: T["value"];
  tabs: T[];
}

interface TabStyle {
  left: number;
  width: number;
  height: number;
}

export const useTabs = <T extends BaseTab>({
  initialTab,
  tabs,
}: UseTabsOptions<T>) => {
  const [activeTab, setActiveTab] = useState<T["value"]>(initialTab);
  const [tabStyle, setTabStyle] = useState<TabStyle>({
    left: 0,
    width: 0,
    height: 0, // We track height to ensure it matches exactly
  });
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  // Function to calculate and update the pill's position
  const updateTabPosition = useCallback(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const currentTab = tabsRef.current[activeIndex];

    if (currentTab) {
      setTabStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
        height: currentTab.offsetHeight,
      });
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    updateTabPosition(); // Run initially

    // Recalculate on window resize (responsive behavior)
    window.addEventListener("resize", updateTabPosition);

    return () => window.removeEventListener("resize", updateTabPosition);
  }, [updateTabPosition]);

  return { tabStyle, tabsRef, setActiveTab, activeTab };
};
