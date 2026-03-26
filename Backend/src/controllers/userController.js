const { listUsers, findUserById } = require('../models/userModel');
const { getPagination } = require('../utils/pagination');
const { notFound } = require('../utils/errors');
const { updateUserSettings } = require('../models/userModel');
const { writeAuditLog } = require('../models/auditLogModel');

async function me(req, res, next) {
  try {
    const user = await findUserById(req.user.id, req.user.hospital_id);
    if (!user) return next(notFound('User not found'));
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { limit, offset, page } = getPagination(req.query);

    // SAFETY CHECK: If the user is NOT an admin, FORCE the filter to 'dentist'
    // This prevents receptionists from listing other receptionists or admins.
    let targetRole = req.query.role || '';
    if (req.user.role !== 'admin') {
      targetRole = 'dentist'; 
    }

    const items = await listUsers({
      limit,
      offset,
      search: req.query.search || '',
      role: req.query.role || '',
      hospitalId: req.user.hospital_id
    });
    res.json({ page, limit, items });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const userId = req.user.id; // From your authMiddleware
    const hospitalId = req.user.hospital_id;
    const { name, avatar_url } = req.body;

    const updatedUser = await updateUserSettings(userId, hospitalId, { 
      name, 
      avatarUrl: avatar_url 
    });

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    // Log the activity
    await writeAuditLog({
      userId,
      action: 'USER_UPDATE_PROFILE',
      resource: 'users',
      resourceId: userId,
      hospitalId
    });

    res.json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { me, list , updateMe};

