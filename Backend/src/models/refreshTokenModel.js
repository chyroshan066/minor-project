const { query } = require('../config/db');

async function insertRefreshToken({ userId, tokenHash, expiresAt }) {
  const { rows } = await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token_hash, expires_at, revoked_at, created_at`,
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
}

async function findRefreshTokenByHash(tokenHash) {
  const { rows } = await query(
    `SELECT id, user_id, token_hash, expires_at, revoked_at
     FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function revokeRefreshTokenById(id) {
  await query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`, [id]);
}

async function revokeAllRefreshTokensForUser(userId) {
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

module.exports = {
  insertRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshTokenById,
  revokeAllRefreshTokensForUser
};

