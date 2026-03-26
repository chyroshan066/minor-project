import { apiClient } from "@/lib/api/axios";

export type BillingSummary = {
  total?: number;
  currency?: string;
  paid?: boolean;
  notes?: string;
};

export type Appointment = {
  id: string;
  patient_id: string;
  dentist_id: string;
  date: string;
  time: string;
  status: string | null;
  appointment_status: string | null;
  billing_summary: BillingSummary | null;
  created_at: string;
};

export async function listAppointments(params: {
  page?: number;
  limit?: number;
  patient_id?: string;
  dentist_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{ page: number; limit: number; items: Appointment[] }> {
  const res = await apiClient.get("/appointments", { params });
  return res.data;
}

export async function getAppointment(id: string) {
  const res = await apiClient.get(`/appointments/${id}`);
  return res.data as { appointment: Appointment };
}

export async function createAppointment(payload: {
  patient_email: string;
  dentist_id: string;
  date: string;
  time: string;
  status?: string;
  appointment_status?: string;
  billing_summary?: BillingSummary;
}): Promise<{ appointment: Appointment }> {
  const res = await apiClient.post("appointments", payload);
  return res.data;
}

export async function updateAppointment(
  id: string,
  payload: Partial<{
    patient_id: string;
    dentist_id: string;
    date: string;
    time: string;
    status: string;
    appointment_status: string;
    billing_summary: BillingSummary;
  }>
): Promise<{ appointment: Appointment }> {
  const res = await apiClient.put(`/appointments/${id}`, payload);
  return res.data;
}

export async function deleteAppointment(id: string) {
  await apiClient.delete(`/appointments/${id}`);
  return { ok: true };
}

