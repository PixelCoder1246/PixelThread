const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const recordView = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  await prisma.postAnalytics.upsert({
    where: { postId },
    create: { postId, views: 1 },
    update: { views: { increment: 1 } },
  });
};

const getPostAnalytics = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const [analytics, likesCount, commentsCount] = await Promise.all([
    prisma.postAnalytics.findUnique({
      where: { postId },
      select: { views: true },
    }),
    prisma.like.count({
      where: { postId },
    }),
    prisma.comment.count({
      where: { postId },
    }),
  ]);

  return {
    views: analytics?.views ?? 0,
    likes: likesCount,
    comments: commentsCount,
  };
};

const getMyOverallAnalytics = async (userId) => {
  const [postCounts, viewAgg, likesAgg, commentsAgg] = await Promise.all([
    prisma.post.groupBy({
      by: ['status'],
      where: { authorId: userId },
      _count: { id: true },
    }),
    prisma.postAnalytics.aggregate({
      where: { post: { authorId: userId } },
      _sum: { views: true },
    }),
    prisma.like.count({
      where: { post: { authorId: userId } },
    }),
    prisma.comment.count({
      where: { post: { authorId: userId } },
    }),
  ]);

  const statusMap = {};
  let totalPosts = 0;
  for (const row of postCounts) {
    statusMap[row.status] = row._count.id;
    totalPosts += row._count.id;
  }

  const publishedPosts = statusMap['PUBLISHED'] || 0;
  const draftPosts = statusMap['DRAFT'] || 0;
  const archivedPosts = statusMap['ARCHIVED'] || 0;
  const totalViews = viewAgg._sum.views || 0;
  const totalLikes = likesAgg;
  const totalComments = commentsAgg;

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    archivedPosts,
    totalViews,
    totalLikes,
    totalComments,
    averageViewsPerPost:
      totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0,
    averageLikesPerPost:
      totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
  };
};

const getMyPostsAnalytics = async ({ userId, page, limit, sort }) => {
  const skip = (page - 1) * limit;

  const orderBy =
    sort === 'oldest'
      ? { createdAt: 'asc' }
      : sort === 'mostViewed'
        ? { analytics: { views: 'desc' } }
        : sort === 'mostLiked'
          ? { likes: { _count: 'desc' } }
          : { createdAt: 'desc' };

  const where = { authorId: userId };

  const [posts, totalItems] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        analytics: { select: { views: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      publishedAt: p.publishedAt,
      views: p.analytics?.views ?? 0,
      likes: p._count.likes,
      comments: p._count.comments,
    })),
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getTopPosts = async ({ userId, limit, sort }) => {
  const orderBy =
    sort === 'likes'
      ? { likes: { _count: 'desc' } }
      : { analytics: { views: 'desc' } };

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    take: limit,
    orderBy,
    select: {
      id: true,
      title: true,
      slug: true,
      analytics: { select: { views: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    views: p.analytics?.views ?? 0,
    likes: p._count.likes,
    comments: p._count.comments,
  }));
};

const getAdminAnalytics = async () => {
  const [userCount, postCounts, commentsCount, likesCount, viewsAgg] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.postAnalytics.aggregate({
        _sum: { views: true },
      }),
    ]);

  const statusMap = {};
  let totalPosts = 0;
  for (const row of postCounts) {
    statusMap[row.status] = row._count.id;
    totalPosts += row._count.id;
  }

  return {
    totalUsers: userCount,
    totalPosts,
    publishedPosts: statusMap['PUBLISHED'] || 0,
    draftPosts: statusMap['DRAFT'] || 0,
    archivedPosts: statusMap['ARCHIVED'] || 0,
    totalComments: commentsCount,
    totalLikes: likesCount,
    totalViews: viewsAgg._sum.views || 0,
  };
};

module.exports = {
  recordView,
  getPostAnalytics,
  getMyOverallAnalytics,
  getMyPostsAnalytics,
  getTopPosts,
  getAdminAnalytics,
};
