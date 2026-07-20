const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const storageService = require('../../services/storage/storage.service');
const imageProcessor = require('../../utils/image/imageProcessor');

const mediaSelect = {
  id: true,
  ownerId: true,
  fileName: true,
  originalName: true,
  mimeType: true,
  extension: true,
  size: true,
  width: true,
  height: true,
  storageProvider: true,
  storageKey: true,
  publicUrl: true,
  altText: true,
  createdAt: true,
};

const uploadMedia = async (userId, file, altText) => {
  const processed = await imageProcessor.processImage(file.buffer);

  const extension = '.jpg';

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${extension}`;

  const uploadFile = {
    originalname: fileName,
    buffer: processed.original,
    mimetype: 'image/jpeg',
    size: processed.size,
  };

  const result = await storageService.uploadFile(uploadFile, {
    key: fileName,
  });

  let webpMedia = null;
  if (processed.webp) {
    const webpFileName = fileName.replace(extension, '.webp');
    const webpUploadFile = {
      originalname: webpFileName,
      buffer: processed.webp,
      mimetype: 'image/webp',
      size: processed.webp.length,
    };

    const webpResult = await storageService.uploadFile(webpUploadFile, {
      key: webpFileName,
    });

    webpMedia = await prisma.media.create({
      data: {
        ownerId: userId,
        fileName: webpFileName,
        originalName: file.originalname,
        mimeType: 'image/webp',
        extension: '.webp',
        size: processed.webp.length,
        width: processed.width,
        height: processed.height,
        storageProvider: storageService.providerName,
        storageKey: webpFileName,
        publicUrl: webpResult.publicUrl,
        altText: altText || null,
      },
    });
  }

  let thumbnailMedia = null;
  if (processed.thumbnail) {
    const thumbFileName = `thumb-${fileName}`;
    const thumbUploadFile = {
      originalname: thumbFileName,
      buffer: processed.thumbnail,
      mimetype: 'image/jpeg',
      size: processed.thumbnail.length,
    };

    const thumbResult = await storageService.uploadFile(thumbUploadFile, {
      key: thumbFileName,
    });

    thumbnailMedia = await prisma.media.create({
      data: {
        ownerId: userId,
        fileName: thumbFileName,
        originalName: `thumb-${file.originalname}`,
        mimeType: 'image/jpeg',
        extension: '.jpg',
        size: processed.thumbnail.length,
        width: 200,
        height: null,
        storageProvider: storageService.providerName,
        storageKey: thumbFileName,
        publicUrl: thumbResult.publicUrl,
        altText: altText ? `${altText} (thumbnail)` : null,
      },
    });
  }

  const media = await prisma.media.create({
    data: {
      ownerId: userId,
      fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      extension,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      storageProvider: storageService.providerName,
      storageKey: fileName,
      publicUrl: result.publicUrl,
      altText: altText || null,
    },
  });

  return { media, webp: webpMedia, thumbnail: thumbnailMedia };
};

const deleteMedia = async (mediaId, userId) => {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });

  if (!media) {
    throw new ApiError(404, 'Media not found.');
  }

  if (media.ownerId !== userId) {
    throw new ApiError(403, 'You can only delete your own media.');
  }

  await storageService.deleteFile(media.storageKey);

  const webpKey = media.fileName.replace(media.extension, '.webp');
  await storageService.deleteFile(webpKey).catch(() => {});
  await storageService.deleteFile(`thumb-${media.fileName}`).catch(() => {});

  await prisma.media.delete({ where: { id: mediaId } });
};

const replaceMedia = async (mediaId, userId, newFile, altText) => {
  const existing = await prisma.media.findUnique({
    where: { id: mediaId },
  });

  if (!existing) {
    throw new ApiError(404, 'Media not found.');
  }

  if (existing.ownerId !== userId) {
    throw new ApiError(403, 'You can only replace your own media.');
  }

  const processed = await imageProcessor.processImage(newFile.buffer);

  const extension = '.jpg';
  const newFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${extension}`;

  await storageService.deleteFile(existing.storageKey);

  const webpOldKey = existing.fileName.replace(extension, '.webp');
  await storageService.deleteFile(webpOldKey).catch(() => {});
  await storageService.deleteFile(`thumb-${existing.fileName}`).catch(() => {});

  const uploadFile = {
    originalname: newFileName,
    buffer: processed.original,
    mimetype: 'image/jpeg',
    size: processed.size,
  };

  const result = await storageService.uploadFile(uploadFile, {
    key: newFileName,
  });

  const updated = await prisma.media.update({
    where: { id: mediaId },
    data: {
      fileName: newFileName,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      storageKey: newFileName,
      publicUrl: result.publicUrl,
      altText: altText !== undefined ? altText || null : existing.altText,
    },
    select: mediaSelect,
  });

  return updated;
};

const getMyMedia = async (userId, { page, limit, sort }) => {
  const skip = (page - 1) * limit;

  const orderBy =
    sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [media, totalItems] = await Promise.all([
    prisma.media.findMany({
      where: { ownerId: userId },
      select: mediaSelect,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.media.count({ where: { ownerId: userId } }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    media,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

module.exports = {
  uploadMedia,
  deleteMedia,
  replaceMedia,
  getMyMedia,
};
