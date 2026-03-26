const { query } = require('../config/db');
const { encryptField, decryptField } = require('../utils/crypto');

// Helper to decrypt fields after database retrieval
function rowToPatient(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: decryptField(row.name_enc),
    email: row.email,
    phone: row.phone_enc ? decryptField(row.phone_enc) : null,
    address: row.address,
    medical_history: row.medical_history_enc ? decryptField(row.medical_history_enc) : null,
    created_at: row.created_at
  };
}

async function createPatient({ hospitalId, name, email, phone, address, medical_history }) {
  const { rows } = await query(
    `INSERT INTO patients (hospital_id, name_enc, phone_enc, medical_history_enc, email, address)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name_enc, phone_enc, medical_history_enc, email, address, created_at`,
    [
      hospitalId,
      encryptField(name),
      phone ? encryptField(phone) : null,
      medical_history ? encryptField(medical_history) : null,
      email || null,
      address || null
    ]
  );
  return rowToPatient(rows[0]);
}

async function getPatient(id, hospitalId) {
  const { rows } = await query(
    `SELECT id, name_enc, phone_enc, medical_history_enc, email, address, created_at
     FROM patients
     WHERE id = $1 AND hospital_id = $2 AND deleted_at IS NULL`,
    [id, hospitalId]
  );
  return rowToPatient(rows[0] || null);
}

// FIXED: Using raw SQL instead of Prisma to match your project architecture
async function getPatientByEmail(email, hospitalId) {
  const { rows } = await query(
    `SELECT id, name_enc, phone_enc, medical_history_enc, email, address, created_at
     FROM patients
     WHERE email = $1 AND hospital_id = $2 AND deleted_at IS NULL
     LIMIT 1`,
    [email, hospitalId]
  );
  return rowToPatient(rows[0] || null);
}

async function updatePatient(id, hospitalId, { name, email, phone, address, medical_history }) {
  const current = await getPatient(id, hospitalId);
  if (!current) return null;

  const nextName = name !== undefined ? name : current.name;
  const nextPhone = phone !== undefined ? phone : current.phone;
  const nextHistory = medical_history !== undefined ? medical_history : current.medical_history;

  const { rows } = await query(
    `UPDATE patients
     SET name_enc = $2,
         phone_enc = $3,
         medical_history_enc = $4,
         email = COALESCE($5, email),
         address = COALESCE($6, address)
     WHERE id = $1 AND hospital_id = $7 AND deleted_at IS NULL
     RETURNING id, name_enc, phone_enc, medical_history_enc, email, address, created_at`,
    [
      id,
      encryptField(nextName),
      nextPhone ? encryptField(nextPhone) : null,
      nextHistory ? encryptField(nextHistory) : null,
      email ?? null,
      address ?? null,
      hospitalId
    ]
  );
  return rowToPatient(rows[0] || null);
}

async function softDeletePatient(id, hospitalId) {
  const { rowCount } = await query(
    `UPDATE patients SET deleted_at = NOW() WHERE id = $1 AND hospital_id = $2 AND deleted_at IS NULL`,
    [id, hospitalId]
  );
  return rowCount > 0;
}

async function listPatients({ limit, offset, search, hospitalId }) {
  const where = ['deleted_at IS NULL'];
  const params = [];
  let i = 1;
  where.push(`hospital_id = $${i}`);
  params.push(hospitalId);
  i++;
  
  if (search) {
    where.push(`(email ILIKE $${i} OR address ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }

  const { rows } = await query(
    `SELECT id, name_enc, phone_enc, medical_history_enc, email, address, created_at
     FROM patients
     WHERE ${where.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  return rows.map(rowToPatient);
}

module.exports = {
  createPatient,
  getPatient,
  getPatientByEmail,
  updatePatient,
  softDeletePatient,
  listPatients
};