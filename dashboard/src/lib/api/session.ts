import { apiClient } from "@/lib/api/axios";

export async function logout(refreshToken: string) {
  await apiClient.post("/auth/logout", { refreshToken });
}

