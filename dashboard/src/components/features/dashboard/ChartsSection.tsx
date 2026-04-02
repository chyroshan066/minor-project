// import { ActiveUsersChart } from "@/components/cards/ActiveUsersChart";
import { PatientTimelineChart } from "@/components/cards/PatientTimelineChart";
// import { SalesOverviewChart } from "@/components/cards/SalesOverviewChart";
import { memo } from "react";

export const ChartsSection = memo(() => (
  <div className="flex flex-wrap mt-6 -mx-3">
    {/* <ActiveUsersChart /> */}
    {/* <SalesOverviewChart /> */}
    <PatientTimelineChart />
  </div>
));
