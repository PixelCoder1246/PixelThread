const { sendSuccess } = require('../../utils/ApiResponse');
const {
  validateCreateComment,
  validateUpdateComment,
} = require('./comment.validation');
const commentService = require('./comment.service');

const getThreadedComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id || null;
    const comments = await commentService.getThreadedComments(postId, userId);
    return sendSuccess(res, 200, 'Comments fetched successfully.', {
      comments,
    });
  } catch (err) {
    next(err);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const content = validateCreateComment(req.body);
    const comment = await commentService.createRootComment(
      postId,
      req.user.id,
      content
    );
    return sendSuccess(res, 201, 'Comment created successfully.', { comment });
  } catch (err) {
    next(err);
  }
};

const createReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = validateCreateComment(req.body);
    const comment = await commentService.createReply(id, req.user.id, content);
    return sendSuccess(res, 201, 'Reply created successfully.', { comment });
  } catch (err) {
    next(err);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = validateUpdateComment(req.body);
    const comment = await commentService.updateComment(
      id,
      req.user.id,
      req.user.role,
      content
    );
    return sendSuccess(res, 200, 'Comment updated successfully.', { comment });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await commentService.deleteComment(id, req.user.id, req.user.role);
    return sendSuccess(res, 200, 'Comment deleted successfully.');
  } catch (err) {
    next(err);
  }
};

const getReplies = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const comment = await commentService.getReplies(id, userId);
    return sendSuccess(res, 200, 'Replies fetched successfully.', { comment });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getThreadedComments,
  createComment,
  createReply,
  updateComment,
  deleteComment,
  getReplies,
};
