const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const { env } = require('../config/env');
const { cloudinary } = require('../config/cloudinary');
const { createUpload, listUploads, softDeleteUpload } = require('../models/uploadModel');
const { writeAuditLog } = require('../models/auditLogModel');
const { getPatient } = require('../models/patientModel');
const { getPagination } = require('../utils/pagination');
const { badRequest, notFound } = require('../utils/errors');

async function ensureUploadsDir() {
  const dir = path.join(process.cwd(), 'uploads');
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

function extFromMime(mime) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'application/pdf') return 'pdf';
  return 'bin';
}

function uploadToCloudinary({ buffer, mimeType }) {
  return new Promise((resolve, reject) => {
    const resource_type = mimeType === 'application/pdf' ? 'raw' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type,
        folder: 'dental-management/uploads'
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

async function uploadOne(req, res, next) {
  try {
    if (!req.file) return next(badRequest('file is required'));

    const hospitalId = req.user.hospital_id;
    const { patient_id, kind } = req.body;
    const { originalname, mimetype, size, buffer } = req.file;

    let created;

    if (patient_id) {
      const patient = await getPatient(patient_id, hospitalId);
      if (!patient) return next(notFound('Patient not found'));
    }

    if (env.cloudinaryEnabled) {
      const result = await uploadToCloudinary({ buffer, mimeType: mimetype });
      created = await createUpload({
        hospitalId,
        patientId: patient_id || null,
        uploadedBy: req.user.id,
        kind,
        originalName: originalname,
        mimeType: mimetype,
        sizeBytes: size,
        storage: 'cloudinary',
        url: result.secure_url,
        cloudinaryPublicId: result.public_id
      });
    } else {
      const dir = await ensureUploadsDir();
      const filename = `${uuidv4()}.${extFromMime(mimetype)}`;
      const full = path.join(dir, filename);
      await fs.writeFile(full, buffer);
      const url = `/uploads/${filename}`;
      created = await createUpload({
        hospitalId,
        patientId: patient_id || null,
        uploadedBy: req.user.id,
        kind,
        originalName: originalname,
        mimeType: mimetype,
        sizeBytes: size,
        storage: 'local',
        url
      });
    }

    await writeAuditLog({
      userId: req.user.id,
      hospitalId,
      action: 'UPLOAD_CREATE',
      resource: 'uploads',
      resourceId: created.id,
      metadata: { patient_id: patient_id || null, mime_type: mimetype, size_bytes: size }
    });

    res.status(201).json({ upload: created });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { limit, offset, page } = getPagination(req.query);
    const items = await listUploads({
      limit,
      offset,
      patientId: req.query.patient_id,
      hospitalId: req.user.hospital_id
    });
    res.json({ page, limit, items });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const ok = await softDeleteUpload(req.params.id, req.user.hospital_id);
    if (!ok) return next(notFound('Upload not found'));

    await writeAuditLog({
      userId: req.user.id,
      hospitalId: req.user.hospital_id,
      action: 'UPLOAD_DELETE',
      resource: 'uploads',
      resourceId: req.params.id
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function uploadProfileImage(req, res, next) {
  try {
    if (!req.file) return next(badRequest('Profile image file is required'));

    const { mimetype, buffer } = req.file;

    
    if (env.cloudinaryEnabled) {
      // Custom transformation for profile pictures: 
      // c_fill (fill area), g_face (center on face), w_400, h_400 (400x400 px)
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'dental-management/avatars',
            resource_type: 'image',
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" }
            ]
          },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
        stream.end(buffer);
      });

      // Return the secure URL to the frontend
      // The frontend will then send this URL to register/setup-hospital
      return res.status(200).json({ 
        url: result.secure_url, 
        public_id: result.public_id 
      });
      
    } else {
      // Local storage fallback for profiles
      const dir = await ensureUploadsDir();
      const filename = `avatar-${uuidv4()}.${extFromMime(mimetype)}`;
      const full = path.join(dir, filename);
      await fs.writeFile(full, buffer);
      
      const url = `/uploads/${filename}`;
      return res.status(200).json({ url });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadOne, list, remove , uploadProfileImage};

