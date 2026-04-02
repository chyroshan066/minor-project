"use client";

import { StatCard } from "@/components/cards/StatCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuthStore } from "@/store/authStore";
import { 
  faCoins, 
  faCalendarCheck, 
  faUserPlus, 
  faFileInvoiceDollar 
} from "@fortawesome/free-solid-svg-icons";

export const StatsSection = () => {
  const { stats, loading, error } = useDashboardStats();
  const { accessToken } = useAuthStore();

  // If loading, we show a pulse effect on the container
  const isLoading = loading && accessToken;

  // We build the array using actual stats OR fallback to zeros
  // This ensures the boxes always show up.
  const dynamicStats = [
    {
      id: "revenue",
      title: "Today's Revenue",
      value: `रू ${stats?.todayRevenue?.toLocaleString() || "0"}`,
      change: "Live", 
      icon: faCoins,
      textColor: "text-success",
    },
    {
      id: "appointments",
      title: "Pending Appointments",
      value: stats?.pendingAppointments?.toString() || "0",
      change: "Today",
      icon: faCalendarCheck,
      textColor: "text-info",
    },
    {
      id: "registrations",
      title: "New Registrations",
      value: stats?.newRegistrations?.toString() || "0",
      change: "30d",
      icon: faUserPlus,
      textColor: "text-success",
    },
    {
      id: "unpaid_invoices",
      title: "Unpaid Balance",
      value: `रू ${stats?.unpaidInvoices?.toLocaleString() || "0"}`,
      change: "Due",
      icon: faFileInvoiceDollar,
      textColor: "text-error",
    },
  ];

  return (
    <div className={`flex flex-wrap -mx-3 ${isLoading ? "animate-pulse opacity-70" : ""}`}>
      {dynamicStats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
      
      {/* Optional: Small subtle hint if there is an error while logged in */}
      {error && accessToken && (
        <p className="w-full px-3 text-xs text-slate-400 mt-2">
          Note: Disconnected from live server. Showing cached/zero values.
        </p>
      )}
    </div>
  );
};