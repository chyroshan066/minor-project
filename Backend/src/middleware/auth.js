const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { unauthorized, forbidden } = require('../utils/errors');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized());

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role,
      hospital_id: payload.hospital_id
    };
    return next();
  } catch {
    return next(unauthorized('Invalid or expired token'));
  }
}

function authOptional(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next();
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, role: payload.role, hospital_id: payload.hospital_id };
  } catch {
    // ignore
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (req.user.role !== role) return next(forbidden());
    next();
  };
}

function requireAnyRole(roles) {
  const set = new Set(roles);
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (!set.has(req.user.role)) return next(forbidden());
    next();
  };
}

module.exports = { authRequired, authOptional, requireRole, requireAnyRole };
