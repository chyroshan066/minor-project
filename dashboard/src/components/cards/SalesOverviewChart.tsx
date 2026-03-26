import { ArrowUp } from "../ui/ArrowUp";
import { Card, CardHeader } from "../ui/card";

export const SalesOverviewChart = () => (
  <Card
    outerDivClassName="lg:w-7/12 mt-0 lg:flex-none"
    innerDivClassName="z-20 border-black/12.5 shadow-soft-xl bg-surface"
  >
    <CardHeader className="border-black/12.5 border-solid">
      <h6>Sales overview</h6>
      <ArrowUp percentage="4% more" time="in 2021" />
    </CardHeader>
    <div className="flex-auto p-4">
      <div>
        <canvas id="chart-line" height="300" />
      </div>
    </div>
  </Card>
);
