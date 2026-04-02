// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const api = createApi({
//   reducerPath: "api",
//   baseQuery: fetchBaseQuery({
//     baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
//   }),
//   refetchOnFocus: true,
//   tagTypes: [],
//   endpoints: (builder) => ({}),
// });

// export const {} = api;













// MODIFIED: Added "PatientStats" to tagTypes so patientStatsApi.ts
// can use providesTags: ["PatientStats"] for cache invalidation.

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { useAuthStore } from "@/store/authStore";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    // ADDED: Global auth header injected from Zustand store for all RTK Query requests
    prepareHeaders: (headers) => {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  refetchOnFocus: true,
  // ADDED: "PatientStats" tag for the daily registration chart cache invalidation
  tagTypes: ["PatientStats"],
  endpoints: () => ({}),
});

export const {} = api;