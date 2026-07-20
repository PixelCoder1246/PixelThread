const sharp = require('sharp');
const path = require('path');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const MAX_DIMENSION = 4096;

const processImage = async (buffer, options = {}) => {
  const {
    generateThumbnail = true,
    generateWebp = true,
    thumbnailWidth = 200,
    maxWidth = 1920,
    maxHeight = 1080,
    stripMetadata = true,
  } = options;

  let image = sharp(buffer);

  const metadata = await image.metadata();

  let width = metadata.width;
  let height = metadata.height;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    image = image.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (maxWidth && width > maxWidth) {
    const ratio = maxWidth / width;
    width = maxWidth;
    height = Math.round(height * ratio);
    image = image.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (maxHeight && height > maxHeight) {
    const ratio = maxHeight / height;
    height = maxHeight;
    width = Math.round(width * ratio);
    image = image.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (stripMetadata) {
    image = image.withMetadata({});
  }

  const processedBuffer = await image
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  const finalMeta = await sharp(processedBuffer).metadata();

  let webpBuffer = null;
  if (generateWebp) {
    webpBuffer = await sharp(processedBuffer).webp({ quality: 80 }).toBuffer();
  }

  let thumbnailBuffer = null;
  if (generateThumbnail) {
    thumbnailBuffer = await sharp(processedBuffer)
      .resize(thumbnailWidth, null, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();
  }

  return {
    original: processedBuffer,
    webp: webpBuffer,
    thumbnail: thumbnailBuffer,
    width: finalMeta.width,
    height: finalMeta.height,
    format: finalMeta.format,
    size: processedBuffer.length,
  };
};

const validateImage = (buffer) => {
  if (!buffer || buffer.length === 0) {
    throw new Error('No image data provided.');
  }
};

const isAllowedMimeType = (mimeType) => {
  return ALLOWED_MIME_TYPES.includes(mimeType);
};

const isAllowedExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
};

module.exports = {
  processImage,
  validateImage,
  isAllowedMimeType,
  isAllowedExtension,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
