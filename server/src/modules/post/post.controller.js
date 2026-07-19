const { sendSuccess } = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const {
  validateCreatePost,
  validateUpdatePost,
  validatePagination,
  validateSearchPosts,
} = require('./post.validation');
const postService = require('./post.service');
const { uploadToS3Mock } = require('../../utils/upload.util');
const historyService = require('../history/history.service');

const parseFormDataAndMapFiles = async (req) => {
  let content = req.body.content;
  let tags = req.body.tags;

  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      throw new ApiError(400, 'Invalid JSON format for content blocks.');
    }
  }

  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch (e) {
      throw new ApiError(400, 'Invalid JSON format for tags.');
    }
  }

  if (Array.isArray(content) && req.files && req.files.length > 0) {
    for (let i = 0; i < content.length; i++) {
      const block = content[i];
      if (block.fileIndex !== undefined) {
        const file = req.files[block.fileIndex];
        if (file) {
          block.url = await uploadToS3Mock(file);
          delete block.fileIndex;
        }
      }
    }
  }

  req.body.content = content;
  req.body.tags = tags;
};

const createPost = async (req, res, next) => {
  try {
    await parseFormDataAndMapFiles(req);
    validateCreatePost(req.body);

    const { title, content, excerpt, status, visibility, tags } = req.body;

    const post = await postService.createPost({
      title,
      content,
      excerpt,
      status,
      visibility,
      tags: Array.isArray(tags) ? tags : [],
      authorId: req.user.id,
    });

    return sendSuccess(res, 201, 'Post created successfully.', { post });
  } catch (err) {
    next(err);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const { page, limit } = validatePagination(req.query);
    const result = await postService.getAllPosts({ page, limit });
    return sendSuccess(res, 200, 'Posts fetched successfully.', result);
  } catch (err) {
    next(err);
  }
};

const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const post = await postService.getPostBySlug(slug);

    if (req.user) {
      historyService.recordReading(post.id, req.user.id).catch(() => {});
    }

    return sendSuccess(res, 200, 'Post fetched successfully.', { post });
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    await parseFormDataAndMapFiles(req);
    validateUpdatePost(req.body);

    const { id } = req.params;
    const { title, content, excerpt, status, visibility, tags } = req.body;

    const post = await postService.updatePost(
      id,
      { title, content, excerpt, status, visibility, tags },
      req.user.id,
      req.user.role
    );

    return sendSuccess(res, 200, 'Post updated successfully.', { post });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await postService.deletePost(id, req.user.id, req.user.role);
    return sendSuccess(res, 200, 'Post deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const searchPosts = async (req, res, next) => {
  try {
    const { q, tag, authorId, page, limit, sort } = validateSearchPosts(
      req.query
    );

    const result = await postService.searchPosts({
      q,
      tag,
      authorId,
      page,
      limit,
      sort,
    });

    return sendSuccess(res, 200, 'Posts searched successfully.', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  searchPosts,
};
