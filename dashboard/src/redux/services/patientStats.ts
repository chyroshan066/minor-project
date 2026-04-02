// ADDED: RTK Query endpoint slice for patient registration timeline data.
// Plugs into the existing `api` base created in store/services/api.ts.
// Inject this into your existing api.ts using injectEndpoints pattern.

import { api } from "./api";
import { useAuthStore } from "@/store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyPatientStat {
  date: string;   // "YYYY-MM-DD" from backend
  count: number;  // new registrations on that day
}

export interface PatientStatsResponse {
  items: DailyPatientStat[];
  total: number;
  period_days: number;
}

export interface PatientStatsParams {
  days?: number; // 7 or 30 — how many past days to fetch
}

// ─── Injected Endpoint ────────────────────────────────────────────────────────

// ADDED: Inject into the shared api instance so it shares the same cache/store
export const patientStatsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ADDED: Fetches daily patient registration counts for the past N days
    getPatientDailyStats: builder.query<PatientStatsResponse, PatientStatsParams>({
      query: ({ days = 30 }) => ({
        url: "/patients/stats/daily",
        params: { days },
        // ADDED: Attach auth token from Zustand store for each request
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`,
        },
      }),
      // ADDED: Re-fetch every 5 minutes automatically (300_000ms)
      // Combined with refetchOnFocus: true in api.ts, this gives near-realtime updates
      keepUnusedDataFor: 300,
      providesTags: ["PatientStats"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPatientDailyStatsQuery } = patientStatsApi;