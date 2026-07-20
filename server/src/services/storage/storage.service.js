const path = require('path');

const PROVIDER_MAP = {
  local: 'local.provider',
  s3: 's3.provider',
  cloudinary: 'cloudinary.provider',
  supabase: 'supabase.provider',
};

const providerName = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
const providerFile = PROVIDER_MAP[providerName];

if (!providerFile) {
  throw new Error(
    `Unknown STORAGE_PROVIDER "${providerName}". Supported: ${Object.keys(PROVIDER_MAP).join(', ')}`
  );
}

const provider = require(path.join(__dirname, 'providers', providerFile));

const uploadFile = async (file, options = {}) => {
  return provider.uploadFile(file, options);
};

const deleteFile = async (fileKey) => {
  return provider.deleteFile(fileKey);
};

const getFileUrl = (fileKey) => {
  return provider.getFileUrl(fileKey);
};

const fileExists = async (fileKey) => {
  return provider.fileExists(fileKey);
};

const replaceFile = async (oldKey, newFile, options = {}) => {
  return provider.replaceFile(oldKey, newFile, options);
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
  fileExists,
  replaceFile,
  providerName,
};
