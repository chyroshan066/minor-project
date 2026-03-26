import { apiClient } from "@/lib/api/axios";

import type { Appointment } from "@/lib/api/appointments";

export async function dailySchedule(params: {
  date: string;
  page?: number;
  limit?: number;
}): Promise<{ page: number; limit: number; items: Appointment[] }> {
  const res = await apiClient.get("/dentists/me/daily-schedule", {
    params: {
      date: params.date,
      page: params.page,
      limit: params.limit,
    },
  });
  return res.data;
}

