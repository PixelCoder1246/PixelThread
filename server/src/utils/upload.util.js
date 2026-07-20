const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { sendError } = require('./ApiResponse');
const logger = require('../config/logger');

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const sanitizeFilename = (originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const nameWithoutExt = path.basename(originalName, ext);
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 100);
  return sanitized || 'file';
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      Object.assign(
        new Error(
          `File type ${ext} is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
        ),
        {
          isOperational: true,
          statusCode: 400,
        }
      ),
      false
    );
  }

  if (!ALLOWED_MIMES.includes(mime)) {
    return cb(
      Object.assign(new Error(`MIME type ${mime} is not allowed.`), {
        isOperational: true,
        statusCode: 400,
      }),
      false
    );
  }

  const basename = path.basename(file.originalname);
  if (basename !== file.originalname) {
    return cb(
      Object.assign(new Error('Invalid filename: path traversal detected.'), {
        isOperational: true,
        statusCode: 400,
      }),
      false
    );
  }

  cb(null, true);
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10,
    fileSize: MAX_FILE_SIZE,
  },
});

const uploadToS3Mock = async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const serverUrl = process.env.API_URL || 'http://localhost:5000';
  return `${serverUrl}/uploads/${file.filename}`;
};

const deletePostImages = async (content) => {
  if (!Array.isArray(content)) return;

  for (const block of content) {
    if (
      block.url &&
      typeof block.url === 'string' &&
      block.url.includes('/uploads/')
    ) {
      const filename = block.url.split('/uploads/').pop()?.split('?')[0];
      if (!filename || filename.includes('..') || filename.includes('/'))
        continue;
      const filePath = path.join(uploadsDir, filename);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          logger.error(`Failed to delete file: ${filePath}`, {
            error: err.message,
          });
        }
      }
    }
  }
};

module.exports = {
  upload,
  uploadToS3Mock,
  deletePostImages,
  ALLOWED_MIMES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
};
