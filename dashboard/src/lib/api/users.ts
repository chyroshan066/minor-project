import { apiClient } from "@/lib/api/axios";
import type { Role } from "@/store/authStore";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  hospital_id: string;
  created_at: string;
  avatar_url?: string;
};

export async function me(): Promise<{ user: User }> {
  const res = await apiClient.get("/users/me");
  return res.data;
}

export async function listUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | "";
}): Promise<{ page: number; limit: number; items: User[] }> {
  const res = await apiClient.get("/users", { params });
  return res.data;
}

