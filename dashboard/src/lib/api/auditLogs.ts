import { apiClient } from "@/lib/api/axios";

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  metadata: unknown;
  timestamp: string;
};

export async function listAuditLogs(params: {
  page?: number;
  limit?: number;
  user_id?: string;
  action?: string;
  resource?: string;
}): Promise<{ page: number; limit: number; items: AuditLog[] }> {
  const res = await apiClient.get("/audit-logs", { params });
  return res.data;
}

