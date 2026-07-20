const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadsDir = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const generateKey = (originalName) => {
  const uniqueSuffix = crypto.randomBytes(16).toString('hex');
  const ext = path.extname(originalName);
  return `${uniqueSuffix}${ext}`;
};

const uploadFile = async (file, options = {}) => {
  const key = options.key || generateKey(file.originalname);
  const destPath = path.join(uploadsDir, key);

  if (file.buffer) {
    await fs.promises.writeFile(destPath, file.buffer);
  } else if (file.path) {
    await fs.promises.rename(file.path, destPath);
  } else {
    throw new Error('No file data provided.');
  }

  const serverUrl = process.env.API_URL || 'http://localhost:5000';
  const publicUrl = `${serverUrl}/uploads/${key}`;

  return { key, publicUrl };
};

const deleteFile = async (fileKey) => {
  if (!fileKey) return;
  const filePath = path.join(uploadsDir, fileKey);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Failed to delete file: ${filePath}`, err);
    }
  }
};

const getFileUrl = (fileKey) => {
  const serverUrl = process.env.API_URL || 'http://localhost:5000';
  return `${serverUrl}/uploads/${fileKey}`;
};

const fileExists = async (fileKey) => {
  const filePath = path.join(uploadsDir, fileKey);
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const replaceFile = async (oldKey, newFile, options = {}) => {
  await deleteFile(oldKey);
  return uploadFile(newFile, options);
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
  fileExists,
  replaceFile,
};
