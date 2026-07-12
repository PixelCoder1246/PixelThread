const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const authorSelect = { id: true, name: true, image: true };

const buildCommentTree = (comments, userId) => {
  const map = {};
  const roots = [];

  for (const c of comments) {
    map[c.id] = {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      author: c.user,
      likeCount: c._count?.likes ?? 0,
      isLiked: userId ? (c.likes?.length ?? 0) > 0 : false,
      replies: [],
    };
  }

  for (const c of comments) {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(map[c.id]);
    } else if (!c.parentId) {
      roots.push(map[c.id]);
    }
  }

  return roots;
};

const getAllDescendantIds = async (commentId) => {
  const parent = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { postId: true },
  });

  if (!parent) {
    return [];
  }

  const allPostComments = await prisma.comment.findMany({
    where: { postId: parent.postId },
    select: { id: true, parentId: true },
  });

  const childrenMap = {};
  for (const c of allPostComments) {
    if (c.parentId) {
      if (!childrenMap[c.parentId]) {
        childrenMap[c.parentId] = [];
      }
      childrenMap[c.parentId].push(c.id);
    }
  }

  const descendants = [];
  const stack = [commentId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    const children = childrenMap[currentId] || [];
    for (const childId of children) {
      descendants.push(childId);
      stack.push(childId);
    }
  }

  return descendants;
};

const getThreadedComments = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: { select: authorSelect },
      _count: { select: { likes: true } },
      ...(userId ? { likes: { where: { userId }, select: { id: true } } } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });

  return buildCommentTree(comments, userId);
};

const createRootComment = async (postId, userId, content) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId,
      parentId: null,
    },
    include: {
      user: { select: authorSelect },
      _count: { select: { likes: true } },
    },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.user,
    likeCount: comment._count.likes,
    isLiked: false,
    replies: [],
  };
};

const createReply = async (commentId, userId, content) => {
  const parent = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, postId: true },
  });

  if (!parent) {
    throw new ApiError(404, 'Comment not found.');
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId: parent.postId,
      userId,
      parentId: commentId,
    },
    include: {
      user: { select: authorSelect },
      _count: { select: { likes: true } },
    },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.user,
    likeCount: comment._count.likes,
    isLiked: false,
    replies: [],
  };
};

const updateComment = async (commentId, userId, userRole, content) => {
  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existing) {
    throw new ApiError(404, 'Comment not found.');
  }

  if (existing.userId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(
      403,
      'You do not have permission to update this comment.'
    );
  }

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: { select: authorSelect },
      _count: { select: { likes: true } },
    },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.user,
    likeCount: comment._count.likes,
    isLiked: false,
    replies: [],
  };
};

const deleteComment = async (commentId, userId, userRole) => {
  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existing) {
    throw new ApiError(404, 'Comment not found.');
  }

  if (existing.userId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(
      403,
      'You do not have permission to delete this comment.'
    );
  }

  const descendantIds = await getAllDescendantIds(commentId);
  const allIds = [commentId, ...descendantIds];

  await prisma.$transaction([
    prisma.like.deleteMany({ where: { commentId: { in: allIds } } }),
    prisma.comment.deleteMany({ where: { id: { in: allIds } } }),
  ]);
};

const getReplies = async (commentId, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, postId: true },
  });

  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  const allComments = await prisma.comment.findMany({
    where: { postId: comment.postId },
    include: {
      user: { select: authorSelect },
      _count: { select: { likes: true } },
      ...(userId ? { likes: { where: { userId }, select: { id: true } } } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });

  const map = {};
  for (const c of allComments) {
    map[c.id] = {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      author: c.user,
      likeCount: c._count?.likes ?? 0,
      isLiked: userId ? (c.likes?.length ?? 0) > 0 : false,
      replies: [],
    };
  }

  for (const c of allComments) {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies.push(map[c.id]);
    }
  }

  return map[commentId] || null;
};

module.exports = {
  getThreadedComments,
  createRootComment,
  createReply,
  updateComment,
  deleteComment,
  getReplies,
};
