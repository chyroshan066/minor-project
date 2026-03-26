const { query } = require('../config/db');

async function createUpload({
  hospitalId,
  patientId,
  uploadedBy,
  kind,
  originalName,
  mimeType,
  sizeBytes,
  storage,
  url,
  cloudinaryPublicId
}) {
  const { rows } = await query(
    `INSERT INTO uploads (
        hospital_id, patient_id, uploaded_by, kind, original_name, mime_type, size_bytes, storage, url, cloudinary_public_id
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id, patient_id, uploaded_by, kind, original_name, mime_type, size_bytes, storage, url, cloudinary_public_id, created_at`,
    [
      hospitalId,
      patientId || null,
      uploadedBy || null,
      kind || 'medical_file',
      originalName,
      mimeType,
      sizeBytes,
      storage,
      url || null,
      cloudinaryPublicId || null
    ]
  );
  return rows[0];
}

async function listUploads({ limit, offset, patientId, hospitalId }) {
  const where = ['deleted_at IS NULL', 'hospital_id = $1'];
  const params = [];
  params.push(hospitalId);
  let i = 2;
  if (patientId) {
    where.push(`patient_id = $${i}`);
    params.push(patientId);
    i++;
  }
  params.push(limit);
  params.push(offset);

  const { rows } = await query(
    `SELECT id, patient_id, uploaded_by, kind, original_name, mime_type, size_bytes, storage, url, cloudinary_public_id, created_at
     FROM uploads
     WHERE ${where.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return rows;
}

async function softDeleteUpload(id, hospitalId) {
  const { rowCount } = await query(
    `UPDATE uploads SET deleted_at = NOW() WHERE id = $1 AND hospital_id = $2 AND deleted_at IS NULL`,
    [id, hospitalId]
  );
  return rowCount > 0;
}

module.exports = { createUpload, listUploads, softDeleteUpload };

