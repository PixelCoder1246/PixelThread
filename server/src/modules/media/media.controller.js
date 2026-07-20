const { sendSuccess } = require('../../utils/ApiResponse');
const mediaService = require('./media.service');
const {
  validateUpload,
  validateMediaId,
  validatePagination,
} = require('./media.validation');

const uploadMedia = async (req, res, next) => {
  try {
    validateUpload(req.file);
    const altText = req.body.altText || null;
    const result = await mediaService.uploadMedia(
      req.user.id,
      req.file,
      altText
    );
    return sendSuccess(res, 201, 'Media uploaded successfully.', {
      id: result.media.id,
      url: result.media.publicUrl,
      key: result.media.storageKey,
    });
  } catch (err) {
    next(err);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    const id = validateMediaId(req.params);
    await mediaService.deleteMedia(id, req.user.id);
    return sendSuccess(res, 200, 'Media deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const replaceMedia = async (req, res, next) => {
  try {
    const id = validateMediaId(req.params);
    validateUpload(req.file);
    const altText = req.body.altText;
    const result = await mediaService.replaceMedia(
      id,
      req.user.id,
      req.file,
      altText
    );
    return sendSuccess(res, 200, 'Media replaced successfully.', {
      id: result.id,
      url: result.publicUrl,
      key: result.storageKey,
    });
  } catch (err) {
    next(err);
  }
};

const getMyMedia = async (req, res, next) => {
  try {
    const pagination = validatePagination(req.query);
    const result = await mediaService.getMyMedia(req.user.id, pagination);
    return sendSuccess(res, 200, 'Media fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadMedia,
  deleteMedia,
  replaceMedia,
  getMyMedia,
};
