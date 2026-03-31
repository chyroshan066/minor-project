// const bcrypt = require('bcryptjs');
// const { createUser, findUserByEmail, findUserById } = require('../models/userModel');
// const { createHospital } = require('../models/hospitalModel');
// const {
//   insertRefreshToken,
//   findRefreshTokenByHash,
//   revokeRefreshTokenById,
//   revokeAllRefreshTokensForUser
// } = require('../models/refreshTokenModel');
// const { writeAuditLog } = require('../models/auditLogModel');
// const { badRequest, unauthorized, forbidden } = require('../utils/errors');
// const { sha256Base64Url } = require('../utils/crypto');
// const { signAccessToken, signRefreshToken, verifyRefreshToken, newTokenId } = require('../utils/tokens');

// function expiresAtFromJwtSeconds(exp) {
//   return new Date(exp * 1000);
// }

// async function register(req, res, next) {
//   try {
//     if (!req.user) return next(forbidden('Use setup-hospital to create the first admin'));

//     const { name, email, password, avatar_url } = req.body;
//     const hospitalId = req.user.hospital_id;

//     const role = req.user.role === 'admin' ? (req.body.role || 'receptionist') : 'receptionist';
//     if (req.user.role !== 'admin' && role === 'admin') return next(forbidden());

//     const existing = await findUserByEmail({ email, hospitalId });
//     if (existing) return next(badRequest('Email already in use'));

//     const passwordHash = await bcrypt.hash(password, 12);
//     console.log("DEBUG - DATA SENT TO MODEL:", { name, email, avatar_url });
//     // Pass avatarUrl to the model
//     const user = await createUser({ 
//       name, 
//       email, 
//       passwordHash, 
//       role, 
//       hospitalId, 
//       avatarUrl: avatar_url 
//     });

//     await writeAuditLog({
//       userId: user.id,
//       action: 'USER_REGISTER',
//       resource: 'users',
//       resourceId: user.id,
//       hospitalId
//     });

//     res.status(201).json({ user });
//   } catch (err) {
//     next(err);
//   }
// }

// async function login(req, res, next) {
//   try {
//     const { email, password, hospital_id } = req.body;
//     const hospitalId = hospital_id;

//     const user = await findUserByEmail({ email, hospitalId });
//     if (!user) return next(unauthorized('Invalid credentials'));

//     const ok = await bcrypt.compare(password, user.password_hash);
//     if (!ok) return next(unauthorized('Invalid credentials'));

//     const accessToken = signAccessToken({ userId: user.id, role: user.role, hospitalId });
//     const tokenId = newTokenId();
//     const refreshToken = signRefreshToken({ userId: user.id, tokenId, hospitalId });
//     const refreshPayload = verifyRefreshToken(refreshToken);

//     const tokenHash = sha256Base64Url(refreshToken);
//     await insertRefreshToken({
//       userId: user.id,
//       tokenHash,
//       expiresAt: expiresAtFromJwtSeconds(refreshPayload.exp)
//     });

//     await writeAuditLog({
//       userId: user.id,
//       action: 'USER_LOGIN',
//       resource: 'users',
//       resourceId: user.id,
//       hospitalId
//     });

//     res.json({
//       accessToken,
//       refreshToken,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar_url: user.avatar_url,
//         hospital_id: user.hospital_id,
//         created_at: user.created_at
//       }
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// async function refresh(req, res, next) {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken) return next(badRequest('refreshToken is required'));

//     let payload;
//     try {
//       payload = verifyRefreshToken(refreshToken);
//     } catch {
//       return next(unauthorized('Invalid or expired refresh token'));
//     }

//     const tokenHash = sha256Base64Url(refreshToken);
//     const stored = await findRefreshTokenByHash(tokenHash);
//     if (!stored) return next(unauthorized('Refresh token not recognized'));
//     if (stored.revoked_at) return next(unauthorized('Refresh token revoked'));
//     if (new Date(stored.expires_at).getTime() <= Date.now()) return next(unauthorized('Refresh token expired'));

//     await revokeRefreshTokenById(stored.id);

//     const userId = payload.sub;
//     const hospitalIdFromToken = payload.hospital_id;
//     const user = await findUserById(userId, hospitalIdFromToken);
    
//     if (!user) return next(unauthorized('User not found'));
//     if (user.hospital_id !== hospitalIdFromToken) return next(unauthorized('Tenant mismatch'));
    
//     const accessToken = signAccessToken({ userId, role: user.role, hospitalId: hospitalIdFromToken });

//     const newTid = newTokenId();
//     const newRefreshToken = signRefreshToken({ userId, tokenId: newTid, hospitalId: hospitalIdFromToken });
//     const newRefreshPayload = verifyRefreshToken(newRefreshToken);
//     const newHash = sha256Base64Url(newRefreshToken);

//     await insertRefreshToken({
//       userId,
//       tokenHash: newHash,
//       expiresAt: expiresAtFromJwtSeconds(newRefreshPayload.exp)
//     });

//     await writeAuditLog({
//       userId,
//       action: 'TOKEN_REFRESH',
//       resource: 'refresh_tokens',
//       resourceId: stored.id,
//       hospitalId: hospitalIdFromToken
//     });

//     // Return the user object so frontend state doesn't lose the avatar_url
//     res.json({ 
//       accessToken, 
//       refreshToken: newRefreshToken,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar_url: user.avatar_url,
//         hospital_id: user.hospital_id,
//         created_at: user.created_at
//       }
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// async function logout(req, res, next) {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken) return next(badRequest('refreshToken is required'));

//     let payload;
//     try {
//       payload = verifyRefreshToken(refreshToken);
//     } catch {
//       return next(unauthorized('Invalid or expired refresh token'));
//     }
//     const hospitalId = payload.hospital_id;

//     const tokenHash = sha256Base64Url(refreshToken);
//     const stored = await findRefreshTokenByHash(tokenHash);
//     if (stored && !stored.revoked_at) await revokeRefreshTokenById(stored.id);

//     await writeAuditLog({
//       userId: stored ? stored.user_id : null,
//       action: 'USER_LOGOUT',
//       resource: 'refresh_tokens',
//       resourceId: stored ? stored.id : null,
//       hospitalId
//     });

//     res.status(204).send();
//   } catch (err) {
//     next(err);
//   }
// }

// async function logoutAll(req, res, next) {
//   try {
//     await revokeAllRefreshTokensForUser(req.user.id);
//     await writeAuditLog({
//       userId: req.user.id,
//       action: 'USER_LOGOUT_ALL',
//       resource: 'refresh_tokens',
//       hospitalId: req.user.hospital_id
//     });
//     res.status(204).send();
//   } catch (err) {
//     next(err);
//   }
// }

// async function setupHospital(req, res, next) {
//   try {
//     const { hospital_name, license_number, address, admin_name, admin_email, admin_password, admin_avatar_url } = req.body;

//     const createdHospital = await createHospital({ name: hospital_name, licenseNumber: license_number, address });

//     const bcryptHash = await bcrypt.hash(admin_password, 12);
//     const existing = await findUserByEmail({ email: admin_email, hospitalId: createdHospital.id });
//     if (existing) return next(badRequest('Admin email already in use for this hospital'));

//     const createdAdmin = await createUser({
//       name: admin_name,
//       email: admin_email,
//       passwordHash: bcryptHash,
//       role: 'admin',
//       hospitalId: createdHospital.id,
//       avatarUrl: admin_avatar_url
//     });

//     const accessToken = signAccessToken({ userId: createdAdmin.id, role: createdAdmin.role, hospitalId: createdHospital.id });
//     const tokenId = newTokenId();
//     const refreshToken = signRefreshToken({ userId: createdAdmin.id, tokenId, hospitalId: createdHospital.id });
//     const refreshPayload = verifyRefreshToken(refreshToken);
//     const tokenHash = sha256Base64Url(refreshToken);
//     await insertRefreshToken({
//       userId: createdAdmin.id,
//       tokenHash,
//       expiresAt: expiresAtFromJwtSeconds(refreshPayload.exp)
//     });

//     await writeAuditLog({
//       userId: createdAdmin.id,
//       action: 'HOSPITAL_SETUP',
//       resource: 'hospitals',
//       resourceId: createdHospital.id,
//       hospitalId: createdHospital.id,
//       metadata: { admin_email }
//     });

//     res.status(201).json({
//       accessToken,
//       refreshToken,
//       hospital: createdHospital,
//       user: {
//         id: createdAdmin.id,
//         name: createdAdmin.name,
//         email: createdAdmin.email,
//         role: createdAdmin.role,
//         avatar_url: createdAdmin.avatar_url,
//         hospital_id: createdHospital.id,
//         created_at: createdAdmin.created_at
//       }
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// module.exports = { register, login, refresh, logout, logoutAll, setupHospital };


























// Add this import at the top of the file if not already present
const { pool } = require('../config/db');

async function setupHospital(req, res, next) {
  const client = await pool.connect();
  try {
    const {
      hospital_name,
      license_number,
      address,
      admin_name,
      admin_email,
      admin_password,
      admin_avatar_url
    } = req.body;

    // Start transaction
    await client.query('BEGIN');

    // 1. Insert hospital
    const hospitalRes = await client.query(
      `INSERT INTO hospitals (name, license_number, address)
       VALUES ($1, $2, $3)
       RETURNING id, name, license_number, address, created_at`,
      [hospital_name, license_number, address || null]
    );
    const createdHospital = hospitalRes.rows[0];

    // 2. Hash password
    const bcryptHash = await bcrypt.hash(admin_password, 12);

    // 3. Insert admin user
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, hospital_id, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role, hospital_id, avatar_url, created_at`,
      [admin_name, admin_email, bcryptHash, 'admin', createdHospital.id, admin_avatar_url || null]
    );
    const createdAdmin = userRes.rows[0];

    // 4. Generate tokens
    const accessToken = signAccessToken({
      userId: createdAdmin.id,
      role: createdAdmin.role,
      hospitalId: createdHospital.id
    });
    const tokenId = newTokenId();
    const refreshToken = signRefreshToken({
      userId: createdAdmin.id,
      tokenId,
      hospitalId: createdHospital.id
    });
    const refreshPayload = verifyRefreshToken(refreshToken);
    const tokenHash = sha256Base64Url(refreshToken);

    // 5. Insert refresh token
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [createdAdmin.id, tokenHash, expiresAtFromJwtSeconds(refreshPayload.exp)]
    );

    // 6. Audit log
    await client.query(
      `INSERT INTO audit_logs (user_id, hospital_id, action, resource, resource_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        createdAdmin.id,
        createdHospital.id,
        'HOSPITAL_SETUP',
        'hospitals',
        createdHospital.id,
        JSON.stringify({ admin_email })
      ]
    );

    // Commit transaction
    await client.query('COMMIT');

    res.status(201).json({
      accessToken,
      refreshToken,
      hospital: createdHospital,
      user: {
        id: createdAdmin.id,
        name: createdAdmin.name,
        email: createdAdmin.email,
        role: createdAdmin.role,
        avatar_url: createdAdmin.avatar_url,
        hospital_id: createdHospital.id,
        created_at: createdAdmin.created_at
      }
    });
  } catch (err) {
    // Rollback on any error
    await client.query('ROLLBACK');
    
    // Handle duplicate key violations
    if (err.code === '23505') {
      if (err.constraint === 'hospitals_license_number_key') {
        return res.status(409).json({ error: 'A hospital with this license number already exists' });
      }
      if (err.constraint === 'uq_users_hospital_email') {
        return res.status(409).json({ error: 'Admin email already registered for this hospital' });
      }
    }
    // Pass other errors to the global handler
    next(err);
  } finally {
    client.release();
  }
}