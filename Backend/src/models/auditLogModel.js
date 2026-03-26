const { query } = require('../config/db');

async function writeAuditLog({ userId, hospitalId, action, resource, resourceId, metadata }) {
  await query(
    `INSERT INTO audit_logs (hospital_id, user_id, action, resource, resource_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      hospitalId,
      userId || null,
      action,
      resource,
      resourceId || null,
      metadata ? JSON.stringify(metadata) : null
    ]
  );
}

async function listAuditLogs({ limit, offset, hospitalId, userId, action, resource }) {
  const where = [`hospital_id = $1`];
  const params = [];
  params.push(hospitalId);
  let i = 2;
  if (userId) {
    where.push(`user_id = $${i}`);
    params.push(userId);
    i++;
  }
  if (action) {
    where.push(`action = $${i}`);
    params.push(action);
    i++;
  }
  if (resource) {
    where.push(`resource = $${i}`);
    params.push(resource);
    i++;
  }
  params.push(limit);
  params.push(offset);

  const { rows } = await query(
    `SELECT id, user_id, action, resource, resource_id, metadata, timestamp
     FROM audit_logs
     WHERE ${where.join(' AND ')}
     ORDER BY timestamp DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    params
  );
  return rows;
}

module.exports = { writeAuditLog, listAuditLogs };

