const crypto = require('crypto');
const { env } = require('../config/env');

function getEncKey() {
  const key = Buffer.from(env.MEDICAL_RECORD_ENC_KEY_B64, 'base64');
  if (key.length !== 32) throw new Error('MEDICAL_RECORD_ENC_KEY_B64 must decode to 32 bytes');
  return key;
}

function encryptString(plaintext) {
  const iv = crypto.randomBytes(12);
  const key = getEncKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv_b64: iv.toString('base64'),
    tag_b64: tag.toString('base64'),
    data_b64: ciphertext.toString('base64')
  };
}

function decryptString(payload) {
  const key = getEncKey();
  const iv = Buffer.from(payload.iv_b64, 'base64');
  const tag = Buffer.from(payload.tag_b64, 'base64');
  const data = Buffer.from(payload.data_b64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return plaintext.toString('utf8');
}

function packEncrypted(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
}

function unpackEncrypted(b64) {
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

function encryptField(value) {
  return packEncrypted(encryptString(value ?? ''));
}

function decryptField(b64) {
  if (!b64) return null;
  const payload = unpackEncrypted(b64);
  return decryptString(payload);
}

function sha256Base64Url(input) {
  const hash = crypto.createHash('sha256').update(input).digest('base64url');
  return hash;
}

module.exports = {
  encryptField,
  decryptField,
  sha256Base64Url
};

