const multer = require('multer');
const { env } = require('../config/env');
const { badRequest } = require('../utils/errors');

const allowedMime = new Set([
   'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/gif',
  'image/tiff',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',

  
  
]);

// Added: Specific set for Profile Pictures (No PDFs)
const profileAllowedMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/gif',
  'image/tiff'
]);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!allowedMime.has(file.mimetype)) {
    return cb(badRequest('Only images (jpg/png/webp) and pdf are allowed'));
  }
  cb(null, true);
}

// Added: Custom filter for profiles
function profileFileFilter(req, file, cb) {
  if (!profileAllowedMime.has(file.mimetype)) {
    return cb(badRequest('Profile picture must be an image (jpg/png/webp)'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.UPLOAD_MAX_MB * 1024 * 1024
  }
});

// Added: Specific multer instance for profiles (usually smaller limit)
const uploadAvatar = multer({
  storage,
  fileFilter: profileFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // Hardcoded 2MB limit for avatars to save Cloudinary space
  }
});

function multerErrorHandler(err, req, res, next) {
  if (!err) return next();
  if (err.code === 'LIMIT_FILE_SIZE') return next(badRequest(`File too large (max ${env.UPLOAD_MAX_MB}MB)`));
  next(err);
}

module.exports = { 
  upload, 
  uploadAvatar, // Export this for the profile route
  multerErrorHandler, 
  allowedMime 
};