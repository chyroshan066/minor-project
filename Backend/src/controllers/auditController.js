const { listAuditLogs } = require('../models/auditLogModel');
const { getPagination } = require('../utils/pagination');

async function list(req, res, next) {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const items = await listAuditLogs({
      limit,
      offset,
      hospitalId: req.user.hospital_id,
      userId: req.query.user_id,
      action: req.query.action,
      resource: req.query.resource
    });
    res.json({ page, limit, items });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };

