const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure uploads directory exists for mock storage
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local Disk Storage acting as a Mock for S3
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

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    files: 10, // Max 10 files as requested
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
});

/**
 * Mock function to upload a file to S3.
 * Currently, files are saved locally by multer.diskStorage.
 * This function just returns the local URL, but simulates an async S3 upload process.
 * When real S3 is implemented, this can be swapped to `@aws-sdk/client-s3` logic
 * or `multer-s3` can be used directly in the multer configuration above.
 *
 * @param {Object} file - The file object from req.files
 * @returns {Promise<string>} The uploaded file URL
 */
const uploadToS3Mock = async (file) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return the local URL which acts as our mock S3 URL
  const serverUrl = process.env.API_URL || 'http://localhost:5000';
  return `${serverUrl}/uploads/${file.filename}`;
};

/**
 * Extract all image filenames from post content blocks and delete them from disk.
 * Handles both absolute URLs (http://localhost:5000/uploads/file.jpg)
 * and relative paths (/uploads/file.jpg).
 *
 * @param {Array} content - Post content (array of blocks with url fields)
 */
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
        // Silently skip if file never existed (ENOENT)
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
