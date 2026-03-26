import { memo } from "react";
import { StatsSection } from "./StatsSection";
import { InformationSection } from "./InformationSection";
import { ChartsSection } from "./ChartsSection";
import { ManagementSection } from "./ManagementSection";
import { Footer } from "@/components/layout/Footer";

export const DashboardView = memo(() => (
  <div className="w-full px-6 py-6 mx-auto">
    <StatsSection />
    <InformationSection />
    <ChartsSection />
    <ManagementSection />
    <Footer />
  </div>
));

DashboardView.displayName = "DashboardView";
