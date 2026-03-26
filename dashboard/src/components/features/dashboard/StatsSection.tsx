import { StatCard } from "@/components/cards/StatCard";
import { STATS } from "@/lib/constants";

export const StatsSection = () => (
  <div className="flex flex-wrap -mx-3">
    {STATS.map((stat, index) => (
      <StatCard key={index} stat={stat} />
    ))}
  </div>
);
