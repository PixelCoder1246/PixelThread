const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const historyInclude = {
  post: {
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      author: {
        select: { id: true, name: true, image: true },
      },
      analytics: {
        select: { views: true },
      },
      tags: {
        select: {
          tag: {
            select: { id: true, name: true },
          },
        },
      },
    },
  },
};

const formatHistory = (history) => {
  const post = history.post;
  return {
    id: history.id,
    postId: history.postId,
    title: post?.title,
    slug: post?.slug,
    excerpt: post?.excerpt,
    author: post?.author,
    publishedAt: post?.publishedAt,
    views: post?.analytics?.views || 0,
    tags: post?.tags?.map((t) => t.tag) || [],
    lastReadAt: history.lastReadAt,
    readCount: history.readCount,
  };
};

const recordReading = async (postId, userId) => {
  await prisma.history.upsert({
    where: { userId_postId: { userId, postId } },
    create: { userId, postId, readCount: 1 },
    update: {
      readCount: { increment: 1 },
      lastReadAt: new Date(),
    },
  });
};

const getHistory = async (userId, { page, limit }) => {
  const skip = (page - 1) * limit;
  const where = { userId };

  const [history, totalItems] = await prisma.$transaction([
    prisma.history.findMany({
      where,
      include: historyInclude,
      skip,
      take: limit,
      orderBy: { lastReadAt: 'desc' },
    }),
    prisma.history.count({ where }),
  ]);

  // Filter out entries where post was deleted
  const validHistory = history.filter((h) => h.post);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    posts: validHistory.map(formatHistory),
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const deleteHistoryItem = async (historyId, userId) => {
  const history = await prisma.history.findUnique({
    where: { id: historyId },
    select: { id: true, userId: true },
  });

  if (!history) {
    throw new ApiError(404, 'History entry not found.');
  }

  if (history.userId !== userId) {
    throw new ApiError(403, 'You can only delete your own history.');
  }

  await prisma.history.delete({
    where: { id: historyId },
  });
};

const clearHistory = async (userId) => {
  await prisma.history.deleteMany({
    where: { userId },
  });
};

module.exports = {
  recordReading,
  getHistory,
  deleteHistoryItem,
  clearHistory,
};
