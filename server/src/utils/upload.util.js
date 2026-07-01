const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
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
      const filename = block.url.split('/uploads/').pop();
      if (!filename) continue;
      const filePath = path.join(uploadsDir, filename);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      }
    }
  }
};

module.exports = {
  upload,
  uploadToS3Mock,
  deletePostImages,
};
