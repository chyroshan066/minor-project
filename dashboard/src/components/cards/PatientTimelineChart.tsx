"use client";

// ADDED: PatientTimelineChart — replaces SalesOverviewChart.tsx
// Displays real patient registration data fetched via RTK Query.
// Uses Chart.js line chart with brand gradient, 7d/30d toggle, and auto-refresh.

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";
import { ArrowUp } from "../ui/ArrowUp";
import { Card, CardHeader } from "../ui/card";
import { useGetPatientDailyStatsQuery } from "@/redux/services/patientStats";

// ADDED: Register only required Chart.js modules (tree-shakeable — keeps bundle small)
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
);

// ─── Types ────────────────────────────────────────────────────────────────────

type Range = "7d" | "30d";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format "YYYY-MM-DD" → "Apr 01" for x-axis labels */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

/** Compute percentage change first → last */
function computeGrowth(counts: number[]): number {
  if (counts.length < 2) return 0;
  const first = counts[0] ?? 1;
  const last = counts[counts.length - 1];
  return Math.round(((last - first) / (first || 1)) * 100);
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

// ADDED: Shown while data is loading — matches card height to avoid layout shift
const ChartSkeleton = () => (
  <div className="flex h-[220px] items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      {/* Animated pulse bars mimicking a chart */}
      <div className="flex items-end gap-1.5 h-16">
        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
          <div
            key={i}
            className="w-4 rounded-t-sm bg-gray-200 animate-pulse"
            style={{
              height: `${h}%`,
              animationDelay: `${i * 80}ms`,
            }}
          />
        ))}
      </div>
      <p className="text-xs text-muted animate-pulse">Loading chart data…</p>
    </div>
  </div>
);

// ─── Error state ──────────────────────────────────────────────────────────────

const ChartError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex h-[220px] flex-col items-center justify-center gap-3">
    <p className="text-sm text-muted text-center">
      Could not load patient data.
    </p>
    <button
      onClick={onRetry}
      className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80"
      style={{ background: "linear-gradient(to top left, #0d6e8f, #06b6d4)" }}
    >
      Retry
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const PatientTimelineChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // ADDED: Range filter — controls how many days the API fetches
  const [range, setRange] = useState<Range>("30d");
  const days = range === "7d" ? 7 : 30;

  // ADDED: RTK Query — auto-fetches on mount, refetches on window focus,
  // and every 5 minutes via keepUnusedDataFor in the endpoint definition.
  // pollingInterval gives true real-time updates every 5 minutes.
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetPatientDailyStatsQuery(
    { days },
    { pollingInterval: 300_000 } // ADDED: poll every 5 min for real-time updates
  );

  // ADDED: Derived stats from API response
  const counts = data?.items.map((r) => r.count) ?? [];
  const labels = data?.items.map((r) => formatDate(r.date)) ?? [];
  const growth = computeGrowth(counts);
  const total = counts.reduce((s, c) => s + c, 0);
  const avg = counts.length ? Math.round(total / counts.length) : 0;
  const peak = counts.length ? Math.max(...counts) : 0;

  // ADDED: Build/rebuild Chart.js instance whenever data or range changes
  const buildChart = useCallback(() => {
    if (!canvasRef.current || !data?.items.length) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // CHANGED: Brand gradient fill — teal→cyan matching --background-image-gradient-brand
    // was rgba(203,12,159) fuchsia — now rgb(13,110,143) teal per globals.css
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, "rgba(13, 110, 143, 0.28)");  // --color-primary teal
    gradient.addColorStop(1, "rgba(6, 182, 212, 0.01)");   // cyan fade-out

    // ADDED: Destroy previous chart before creating a new one
    // (prevents "Canvas is already in use" error on re-render)
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "New Patients",
            data: counts,
            fill: true,
            backgroundColor: gradient,
            // CHANGED: was "rgb(13 110 143)" (space-separated, broken in Chart.js)
            // Chart.js requires comma-separated rgb values
            borderColor: "rgb(13, 110, 143)",   // --color-primary teal
            borderWidth: 3,
            pointBackgroundColor: "rgb(13, 110, 143)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            tension: 0.42, // smooth bezier curve
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            // CHANGED: tooltip border was rgba(203,12,159) pink — now teal
            borderColor: "rgba(13, 110, 143, 0.20)",
            borderWidth: 1,
            titleColor: "rgb(52, 71, 103)",   // --color-main
            bodyColor: "rgb(103, 116, 142)",  // --color-muted
            titleFont: { weight: "bold", size: 12 },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (items) => items[0]?.label ?? "",
              label: (item) =>
                `  ${item.parsed.y} new patient${item.parsed.y !== 1 ? "s" : ""}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: "rgb(103, 116, 142)",  // --color-muted
              font: { size: 11 },
              maxTicksLimit: range === "7d" ? 7 : 8,
              maxRotation: 0,
            },
            border: { display: false },
          },
          y: {
            grid: { color: "rgba(0,0,0,0.05)" },
            ticks: {
              color: "rgb(103, 116, 142)",
              font: { size: 11 },
              stepSize: Math.ceil(peak / 5) || 1,
              padding: 8,
            },
            border: { display: false, dash: [4, 4] },
            beginAtZero: true,
          },
        },
      },
    };

    chartRef.current = new Chart(ctx, config);
  }, [data, labels, counts, range, peak]);

  // ADDED: Rebuild chart whenever data changes
  useEffect(() => {
    buildChart();
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [buildChart]);

  return (
    <Card
      outerDivClassName="lg:w-7/12 mt-0 lg:flex-none"
      innerDivClassName="z-20 border-black/12.5 shadow-soft-xl bg-surface"
    >
      {/* ADDED: Header — mirrors existing CardHeader pattern with range toggle */}
      <CardHeader className="border-black/12.5 border-solid">
        <div className="flex flex-col gap-0.5">
          <h6 className="text-sm font-semibold text-main">
            Patient Registrations
          </h6>
          {/* ADDED: ArrowUp reused — shows growth % from first to last day */}
          {!isLoading && !isError && (
            <ArrowUp
              percentage={`${growth >= 0 ? "+" : ""}${growth}%`}
              time={range === "7d" ? "past 7 days" : "past 30 days"}
            />
          )}
        </div>

        {/* ADDED: 7d / 30d range toggle using brand gradient for active state */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          {(["7d", "30d"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={[
                "rounded-md px-3 py-1 text-xs font-semibold transition-all duration-200",
                range === r
                  // CHANGED: was bg-gradient-soft-purple700-pink500 (fuchsia)
                  // Now uses inline style with brand teal→cyan gradient from globals.css
                  // (no utility class exists for this gradient — using style prop)
                  ? "text-white shadow-sm"
                  : "text-muted hover:text-main",
              ].join(" ")}
              style={
                range === r
                  ? { background: "linear-gradient(to top left, #0d6e8f, #06b6d4)" }
                  : undefined
              }
            >
              {r === "7d" ? "7 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </CardHeader>

      {/* ADDED: Summary stat strip — hidden during load/error states */}
      {!isLoading && !isError && data && (
        <div className="flex items-center gap-6 px-4 pt-3 pb-1">
          <div>
            <p className="text-xs text-muted">Total</p>
            <p className="text-lg font-bold text-main">{total}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Daily Avg</p>
            <p className="text-lg font-bold text-main">{avg}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Peak Day</p>
            <p className="text-lg font-bold text-main">{peak}</p>
          </div>
          {/* ADDED: Live indicator dot — shows data is auto-refreshing */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-xs text-muted">Live</span>
          </div>
        </div>
      )}

      {/* ADDED: Chart area — swaps between skeleton, error, and live chart */}
      <div className="flex-auto p-4">
        <div className="relative h-[220px]">
          {isLoading && <ChartSkeleton />}
          {isError && <ChartError onRetry={refetch} />}
          {/* ADDED: canvas hidden during load/error to avoid Chart.js on empty DOM */}
          <canvas
            ref={canvasRef}
            className={isLoading || isError ? "hidden" : ""}
          />
        </div>
      </div>
    </Card>
  );
};