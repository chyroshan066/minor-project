import { apiClient } from "@/lib/api/axios";
import type { AuthUser, Role } from "@/store/authStore";

export async function login(params: {
  email: string;
  password: string;
  hospital_id: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}> {
  const res = await apiClient.post("/auth/login", params);
  return res.data;
}

export async function setupHospital(params: {
  hospital_name: string;
  license_number: string;
  address?: string | null;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  hospital: { id: string; name: string; license_number: string; address: string | null } | null;
  user: AuthUser;
}> {
  const res = await apiClient.post("/auth/setup-hospital", params);
  return res.data;
}

export async function registerStaff(params: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}): Promise<{ user: AuthUser }> {
  const res = await apiClient.post("/auth/register", params);
  return res.data;
}

