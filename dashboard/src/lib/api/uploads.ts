import { apiClient } from "@/lib/api/axios";

export type Upload = {
  id: string;
  patient_id: string | null;
  uploaded_by: string | null;
  kind: string | null;
  original_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  storage: string;
  url: string | null;
  cloudinary_public_id: string | null;
  created_at: string;
};

/**
 * Standard upload for patient documents (X-rays, records, etc.)
 * Restricted to Admin/Dentist roles on the backend.
 */
export async function uploadOne(payload: {
  file: File;
  patient_id?: string | null;
  kind?: string | null;
}): Promise<{ upload: Upload }> {
  const form = new FormData();
  form.append("file", payload.file); // Matches .single('file') in uploadRoutes
  if (payload.patient_id) form.append("patient_id", payload.patient_id);
  if (payload.kind) form.append("kind", payload.kind);

  const res = await apiClient.post("/uploads", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Specialized upload for User Profile Avatars.
 * Accessible by any authenticated user.
 * Sends request to POST /api/uploads/profile
 */
export async function uploadProfileImage(file: File): Promise<{ url: string; public_id?: string }> {
  const form = new FormData();
  form.append("file", file); // Matches .single('file') in uploadRoutes

  const res = await apiClient.post("/uploads/profile", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function listUploads(params: {
  page?: number;
  limit?: number;
  patient_id?: string;
}): Promise<{ page: number; limit: number; items: Upload[] }> {
  const res = await apiClient.get("/uploads", { params });
  return res.data;
}

export async function deleteUpload(id: string) {
  await apiClient.delete(`/uploads/${id}`);
  return { ok: true };
}