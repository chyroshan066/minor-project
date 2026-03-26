import { apiClient } from "@/lib/api/axios";

export type MedicalRecord = {
  id: string;
  patient_id: string;
  diagnosis: string;
  treatment: string;
  notes: string | null;
  prescription: string | null;
  created_at: string;
};

export async function listMedicalRecordsByPatient(params: {
  patientId: string;
  page?: number;
  limit?: number;
}): Promise<{ page: number; limit: number; items: MedicalRecord[] }> {
  const res = await apiClient.get(
    `/patients/${params.patientId}/medical-records`,
    { params: { page: params.page, limit: params.limit } }
  );
  return res.data;
}

export async function getMedicalRecord(id: string): Promise<{
  medicalRecord: MedicalRecord;
}> {
  const res = await apiClient.get(`/medical-records/${id}`);
  return res.data;
}

export async function createMedicalRecord(payload: {
  patient_id: string;
  diagnosis: string;
  treatment: string;
  notes?: string | null;
  prescription?: string | null;
}): Promise<{ medicalRecord: MedicalRecord }> {
  const res = await apiClient.post(`/medical-records`, payload);
  return res.data;
}

export async function updateMedicalRecord(
  id: string,
  payload: Partial<{
    diagnosis: string;
    treatment: string;
    notes: string | null;
    prescription: string | null;
  }>
): Promise<{ medicalRecord: MedicalRecord }> {
  const res = await apiClient.put(`/medical-records/${id}`, payload);
  return res.data;
}

export async function deleteMedicalRecord(id: string) {
  await apiClient.delete(`/medical-records/${id}`);
  return { ok: true };
}

// Add this to your existing medicalRecords.ts imports/exports
export async function listMedicalRecordsByDentist(params: {
  page?: number;
  limit?: number;
}): Promise<{ page: number; limit: number; items: MedicalRecord[] }> {
  // This matches the new listByDentist controller function we created
  const res = await apiClient.get(`/medical-records`, { 
    params: { page: params.page, limit: params.limit } 
  });
  return res.data;
}

