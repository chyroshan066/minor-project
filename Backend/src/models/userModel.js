const { query } = require('../config/db');

// 1. Added avatarUrl to the input object and the INSERT query
async function createUser({ name, email, passwordHash, role, hospitalId, avatarUrl }) {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, role, hospital_id, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role, hospital_id, avatar_url, created_at`,
    [name, email, passwordHash, role, hospitalId, avatarUrl]
  );
  return rows[0];
}

async function updateUserSettings(id, hospitalId, { name, avatarUrl }) {
  const { rows } = await query(
    `UPDATE users 
     SET name = COALESCE($1, name), 
         avatar_url = COALESCE($2, avatar_url)
         
     WHERE id = $3 AND hospital_id = $4 AND deleted_at IS NULL
     RETURNING id, name, email, role, avatar_url, created_at`,
    [name, avatarUrl, id, hospitalId]
  );
  return rows[0];
}

// 2. Included avatar_url in the SELECT statement
async function findUserByEmail({ email, hospitalId }) {
  const { rows } = await query(
    `SELECT 
        u.id, u.name, u.email, u.password_hash, u.role, u.hospital_id, u.avatar_url, u.created_at,
        h.name as hospital_name 
     FROM users u
     JOIN hospitals h ON u.hospital_id = h.id
     WHERE u.email = $1 AND u.hospital_id = $2 AND u.deleted_at IS NULL`,
    [email, hospitalId]
  );
  return rows[0] || null;
}

// 3. Included avatar_url in the SELECT statement
async function findUserById(id, hospitalId) {
  const { rows } = await query(
    `SELECT 
        u.id, u.name, u.email, u.role, u.hospital_id, u.avatar_url, u.created_at,
        h.name as hospital_name
     FROM users u
     JOIN hospitals h ON u.hospital_id = h.id
     WHERE u.id = $1 AND u.hospital_id = $2 AND u.deleted_at IS NULL`,
    [id, hospitalId]
  );
  return rows[0] || null;
}

async function listUsers({ limit, offset, search, role, hospitalId }) {
  const where = ['deleted_at IS NULL'];
  const params = [];
  let i = 1;

  where.push(`hospital_id = $${i}`);
  params.push(hospitalId);
  i++;

  if (search) {
    where.push(`(name ILIKE $${i} OR email ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }
  if (role) {
    where.push(`role = $${i}`);
    params.push(role);
    i++;
  }

  // Store the indices for limit and offset before pushing them to params
  const limitIdx = i;
  const offsetIdx = i + 1;

  params.push(limit);
  params.push(offset);

  // 4. Included avatar_url in the SELECT statement
  const { rows } = await query(
    `SELECT id, name, email, role, hospital_id, avatar_url, created_at
     FROM users
     WHERE ${where.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params
  );

  return rows;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUserSettings
};