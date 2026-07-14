const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const notificationService = require('../notifications/notification.service');

const userSelect = { id: true, name: true, image: true };

const togglePostLike = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.like.create({
      data: { userId, postId },
    });

    await notificationService.createLikeNotification(postId, userId);
  }

  const likeCount = await prisma.like.count({
    where: { postId },
  });

  return {
    liked: !existing,
    likeCount,
  };
};

const toggleCommentLike = async (commentId, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });

  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  const existing = await prisma.like.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });

  if (existing) {
    await prisma.like.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.like.create({
      data: { userId, commentId },
    });
  }

  const likeCount = await prisma.like.count({
    where: { commentId },
  });

  return {
    liked: !existing,
    likeCount,
  };
};

const getPostLikes = async (postId, page, limit) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const skip = (page - 1) * limit;

  const [likeCount, likes] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    prisma.like.findMany({
      where: { postId },
      select: { user: { select: userSelect } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const users = likes.map((like) => like.user);

  return { likeCount, users };
};

const getCommentLikes = async (commentId, page, limit) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });

  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  const skip = (page - 1) * limit;

  const [likeCount, likes] = await Promise.all([
    prisma.like.count({ where: { commentId } }),
    prisma.like.findMany({
      where: { commentId },
      select: { user: { select: userSelect } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const users = likes.map((like) => like.user);

  return { likeCount, users };
};

const getPostLikeStatus = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const like = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });

  return { liked: !!like };
};

const getCommentLikeStatus = async (commentId, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });

  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  const like = await prisma.like.findUnique({
    where: { userId_commentId: { userId, commentId } },
    select: { id: true },
  });

  return { liked: !!like };
};

module.exports = {
  togglePostLike,
  toggleCommentLike,
  getPostLikes,
  getCommentLikes,
  getPostLikeStatus,
  getCommentLikeStatus,
};
