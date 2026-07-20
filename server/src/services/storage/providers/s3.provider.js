const uploadFile = async (file, options = {}) => {
  throw new Error(
    'S3 Provider not configured. Set STORAGE_PROVIDER=s3 and configure AWS credentials.'
  );
};

const deleteFile = async (fileKey) => {
  throw new Error('S3 Provider not configured.');
};

const getFileUrl = (fileKey) => {
  throw new Error('S3 Provider not configured.');
};

const fileExists = async (fileKey) => {
  throw new Error('S3 Provider not configured.');
};

const replaceFile = async (oldKey, newFile, options = {}) => {
  throw new Error('S3 Provider not configured.');
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
  fileExists,
  replaceFile,
};
