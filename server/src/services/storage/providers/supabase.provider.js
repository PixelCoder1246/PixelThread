const uploadFile = async (file, options = {}) => {
  throw new Error(
    'Supabase Storage Provider not configured. Set STORAGE_PROVIDER=supabase and configure Supabase storage credentials.'
  );
};

const deleteFile = async (fileKey) => {
  throw new Error('Supabase Storage Provider not configured.');
};

const getFileUrl = (fileKey) => {
  throw new Error('Supabase Storage Provider not configured.');
};

const fileExists = async (fileKey) => {
  throw new Error('Supabase Storage Provider not configured.');
};

const replaceFile = async (oldKey, newFile, options = {}) => {
  throw new Error('Supabase Storage Provider not configured.');
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
  fileExists,
  replaceFile,
};
