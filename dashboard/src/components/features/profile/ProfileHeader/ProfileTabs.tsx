import { useTabs } from "@/hooks/useTabs";
import { PROFILE_TABS } from "@/lib/constants";
import { IconTab } from "@/types/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ProfileTabs = () => {
  const { tabStyle, tabsRef, setActiveTab, activeTab } = useTabs<IconTab>({
    initialTab: PROFILE_TABS[0].value,
    tabs: PROFILE_TABS,
  });

  return (
    <div className="w-full max-w-full px-3 mx-auto mt-4 sm:my-auto sm:mr-0 md:w-1/2 md:flex-none lg:w-4/12">
      <div className="relative right-0">
        <ul
          className="relative flex flex-wrap p-1 list-none bg-transparent rounded-xl"
          role="tablist"
        >
          {/* The Moving Pill (Animated Background) */}
          <div
            className="absolute z-10 bg-surface rounded-lg shadow-soft-xxs transition-all duration-300 ease-soft-in-out"
            style={{
              left: tabStyle.left,
              width: tabStyle.width,
              height: tabStyle.height,
              top: "4px", // Matches the p-1 padding of the UL
            }}
          />

          {/* Tab Items */}
          {PROFILE_TABS.map((tab, index) => (
            <li
              key={tab.value}
              ref={(el) => {
                tabsRef.current[index] = el;
              }}
              className="z-30 flex-auto text-center"
            >
              <button
                onClick={() => setActiveTab(tab.value)}
                className="z-30 block w-full px-0 py-1 mb-0 transition-all border-0 rounded-lg ease-soft-in-out bg-transparent text-slate-700 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-border-hover focus-visible:ring-offset-2"
                role="tab"
                aria-selected={activeTab === tab.value}
              >
                <FontAwesomeIcon icon={tab.icon} width={16} height={16} />
                <span className="ml-1">{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
