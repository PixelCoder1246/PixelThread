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
    },
  },
};

const formatHistory = (history) => ({
  id: history.id,
  postId: history.postId,
  title: history.post.title,
  slug: history.post.slug,
  excerpt: history.post.excerpt,
  author: history.post.author,
  publishedAt: history.post.publishedAt,
  views: history.post.analytics?.views || 0,
  lastReadAt: history.lastReadAt,
  readCount: history.readCount,
});

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

  const totalPages = Math.ceil(totalItems / limit);

  return {
    posts: history.map(formatHistory),
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
