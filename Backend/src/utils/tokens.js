const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/env');

function signAccessToken({ userId, role, hospitalId }) {
  return jwt.sign({ role, hospital_id: hospitalId }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN
  });
}

function signRefreshToken({ userId, tokenId, hospitalId }) {
  return jwt.sign({ tid: tokenId, hospital_id: hospitalId }, env.JWT_REFRESH_SECRET, {
    subject: userId,
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

function newTokenId() {
  return crypto.randomUUID();
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  newTokenId
};

