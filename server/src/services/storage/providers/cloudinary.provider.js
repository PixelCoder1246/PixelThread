const uploadFile = async (file, options = {}) => {
  throw new Error(
    'Cloudinary Provider not configured. Set STORAGE_PROVIDER=cloudinary and configure Cloudinary credentials.'
  );
};

const deleteFile = async (fileKey) => {
  throw new Error('Cloudinary Provider not configured.');
};

const getFileUrl = (fileKey) => {
  throw new Error('Cloudinary Provider not configured.');
};

const fileExists = async (fileKey) => {
  throw new Error('Cloudinary Provider not configured.');
};

const replaceFile = async (oldKey, newFile, options = {}) => {
  throw new Error('Cloudinary Provider not configured.');
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
  fileExists,
  replaceFile,
};
