import { Skeleton } from "@/components/ui/Skeleton";

export const StatsSkeleton = () => (
  <div className="flex flex-wrap -mx-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="w-full max-w-full px-3 mb-6 sm:w-1/2 sm:flex-none xl:w-1/4">
        <div className="relative flex flex-col min-w-0 break-words bg-surface shadow-soft-xl rounded-2xl bg-clip-border p-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" /> {/* Title Label */}
              <Skeleton className="h-6 w-24" /> {/* Value */}
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" /> {/* Icon Box */}
          </div>
        </div>
      </div>
    ))}
  </div>
);