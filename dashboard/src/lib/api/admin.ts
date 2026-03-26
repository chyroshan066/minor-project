import { apiClient } from "@/lib/api/axios";

export async function inventoryAlerts(): Promise<{
  items: unknown[];
  generated_at: string;
}> {
  const res = await apiClient.get("/admin/inventory-alerts");
  return res.data;
}

export async function systemHealth(): Promise<Record<string, unknown>> {
  const res = await apiClient.get("/admin/system-health");
  return res.data;
}

