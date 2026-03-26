import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/Skeleton";

export const ChartsSkeleton = () => (
  <div className="flex flex-wrap mt-6 -mx-3">
    {/* Active Users Chart Placeholder */}
    <Card
      outerDivClassName="mt-0 lg:w-5/12 lg:flex-none"
      innerDivClassName="border-black/12.5 shadow-soft-xl z-20 bg-surface p-4"
    >
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-6 w-1/3 mt-4" />
      <Skeleton className="h-4 w-1/2 mt-2" />
    </Card>

    {/* Sales Overview Chart Placeholder */}
    <Card
      outerDivClassName="mt-0 lg:w-7/12 lg:flex-none"
      innerDivClassName="border-black/12.5 shadow-soft-xl z-20 bg-surface p-4"
    >
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </Card>
  </div>
);
