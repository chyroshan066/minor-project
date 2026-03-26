import { apiClient } from "@/lib/api/axios";

export type Patient = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  medical_history: string | null;
  created_at: string;
};

export async function listPatients(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ page: number; limit: number; items: Patient[] }> {
  const res = await apiClient.get("/patients", { params });
  return res.data;
}

export async function getPatient(id: string): Promise<{ patient: Patient }> {
  const res = await apiClient.get(`/patients/${id}`);
  return res.data;
}

export async function createPatient(payload: {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  medical_history?: string | null;
}): Promise<{ patient: Patient }> {
  const res = await apiClient.post("/patients", payload);
  return res.data;
}

export async function updatePatient(
  id: string,
  payload: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    medical_history?: string | null;
  }
): Promise<{ patient: Patient }> {
  const res = await apiClient.put(`/patients/${id}`, payload);
  return res.data;
}

export async function deletePatient(
  id: string
): Promise<{ ok: true } | undefined> {
  await apiClient.delete(`/patients/${id}`);
  return { ok: true };
}

