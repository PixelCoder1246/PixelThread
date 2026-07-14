const { sendSuccess } = require('../../utils/ApiResponse');
const {
  validateCreateTag,
  validatePagination,
  validateTagSort,
} = require('./tag.validation');
const tagService = require('./tag.service');

const getAllTags = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const sort = validateTagSort(req.query);
    const result = await tagService.getAllTags({ page, limit, sort });
    return sendSuccess(res, 200, 'Tags fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getTagPosts = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { page, limit } = validatePagination(req.query);
    const result = await tagService.getTagPosts(name, { page, limit });
    return sendSuccess(res, 200, 'Tag posts fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const createTag = async (req, res, next) => {
  try {
    validateCreateTag(req.body);
    const { name } = req.body;
    const tag = await tagService.createTag(name);
    return sendSuccess(res, 201, 'Tag created successfully.', { tag });
  } catch (err) {
    next(err);
  }
};

const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    await tagService.deleteTag(id);
    return sendSuccess(res, 200, 'Tag deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTags,
  getTagPosts,
  createTag,
  deleteTag,
};
