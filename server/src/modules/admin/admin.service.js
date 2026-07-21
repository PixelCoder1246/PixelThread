const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const notificationService = require('../notifications/notification.service');
const postService = require('../post/post.service');
const commentService = require('../comment/comment.service');
const analyticsService = require('../analytics/analytics.service');
const { createAuditLog } = require('./admin.utils');
const {
  AUDIT_ACTIONS,
  AUDIT_TARGETS,
  DEFAULT_SETTINGS,
} = require('./admin.constants');

const getDashboard = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [userCounts, postCounts, engagementCounts, reportCounts] =
    await Promise.all([
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isEmailVerified: true } }),
        prisma.user.count({ where: { isEmailVerified: false } }),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      ]),
      Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { status: 'PUBLISHED' } }),
        prisma.post.count({ where: { status: 'DRAFT' } }),
        prisma.post.count({ where: { status: 'ARCHIVED' } }),
        prisma.post.count({ where: { createdAt: { gte: startOfDay } } }),
      ]),
      Promise.all([
        prisma.like.count(),
        prisma.comment.count(),
        prisma.postAnalytics.aggregate({ _sum: { views: true } }),
        prisma.bookmark.count(),
        prisma.follow.count(),
      ]),
      Promise.all([
        prisma.report.count({ where: { status: 'PENDING' } }),
        prisma.report.count({ where: { status: 'UNDER_REVIEW' } }),
        prisma.report.count({ where: { status: 'RESOLVED' } }),
      ]),
    ]);

  return {
    users: {
      total: userCounts[0],
      verified: userCounts[1],
      unverified: userCounts[2],
      banned: userCounts[3],
      newToday: userCounts[4],
    },
    posts: {
      total: postCounts[0],
      published: postCounts[1],
      drafts: postCounts[2],
      archived: postCounts[3],
      today: postCounts[4],
    },
    engagement: {
      likes: engagementCounts[0],
      comments: engagementCounts[1],
      views: engagementCounts[2]._sum.views || 0,
      bookmarks: engagementCounts[3],
      followers: engagementCounts[4],
    },
    reports: {
      pending: reportCounts[0],
      underReview: reportCounts[1],
      resolved: reportCounts[2],
    },
  };
};

const getUsers = async (filters, sort, page, limit) => {
  const skip = (page - 1) * limit;

  const where = {};
  where.deletedAt = null;

  if (filters.isEmailVerified !== undefined)
    where.isEmailVerified = filters.isEmailVerified;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.role) where.role = filters.role;

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { username: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const orderBy =
    sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [users, totalItems] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true, followers: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items: users, totalItems, page, limit };
};

const getUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
      bio: true,
      location: true,
      website: true,
      coverImage: true,
      role: true,
      isEmailVerified: true,
      isActive: true,
      lastLoginAt: true,
      language: true,
      timezone: true,
      themePreference: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new ApiError(404, 'User not found.');

  const [
    postCounts,
    totalLikes,
    totalComments,
    totalViews,
    followersCount,
    followingCount,
    reports,
  ] = await Promise.all([
    prisma.post.groupBy({
      by: ['status'],
      where: { authorId: id },
      _count: { id: true },
    }),
    prisma.like.count({ where: { post: { authorId: id } } }),
    prisma.comment.count({ where: { post: { authorId: id } } }),
    prisma.postAnalytics.aggregate({
      where: { post: { authorId: id } },
      _sum: { views: true },
    }),
    prisma.follow.count({ where: { followingId: id } }),
    prisma.follow.count({ where: { followerId: id } }),
    prisma.report.findMany({
      where: { referenceId: id },
      select: {
        id: true,
        reportType: true,
        reportReason: true,
        status: true,
        createdAt: true,
        reporter: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const stats = { totalPosts: 0 };
  for (const row of postCounts) {
    stats[`${row.status.toLowerCase()}Posts`] = row._count.id;
    stats.totalPosts += row._count.id;
  }

  return {
    user,
    statistics: {
      ...stats,
      totalLikes,
      totalComments,
      totalViews: totalViews._sum.views || 0,
      followersCount,
      followingCount,
    },
    reports,
  };
};

const updateUserRole = async (userId, adminId, role) => {
  if (userId === adminId) {
    throw new ApiError(403, 'You cannot change your own role.');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new ApiError(404, 'User not found.');

  if (targetUser.role === role) {
    throw new ApiError(400, `User already has the ${role} role.`);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.CHANGE_ROLE,
    targetType: AUDIT_TARGETS.USER,
    targetId: userId,
    metadata: { from: targetUser.role, to: role },
  });

  await notificationService.createSystemNotification({
    recipientId: userId,
    title: 'Role Updated',
    message: `Your account role has been changed to ${role}.`,
    referenceType: 'USER',
  });

  return updated;
};

const banUser = async (userId, adminId, reason) => {
  if (userId === adminId) {
    throw new ApiError(403, 'You cannot ban yourself.');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new ApiError(404, 'User not found.');

  if (!targetUser.isActive) {
    throw new ApiError(400, 'User is already banned.');
  }

  await prisma.session.deleteMany({ where: { userId } });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: { id: true, name: true, email: true, isActive: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.BAN_USER,
    targetType: AUDIT_TARGETS.USER,
    targetId: userId,
    metadata: { reason },
  });

  await notificationService.createSystemNotification({
    recipientId: userId,
    title: 'Account Banned',
    message: `Your account has been banned. Reason: ${reason}`,
    referenceType: 'USER',
  });

  return updated;
};

const unbanUser = async (userId, adminId) => {
  if (userId === adminId) {
    throw new ApiError(403, 'You cannot unban yourself.');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new ApiError(404, 'User not found.');
  if (targetUser.isActive) {
    throw new ApiError(400, 'User is not banned.');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
    select: { id: true, name: true, email: true, isActive: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.UNBAN_USER,
    targetType: AUDIT_TARGETS.USER,
    targetId: userId,
    metadata: {},
  });

  await notificationService.createSystemNotification({
    recipientId: userId,
    title: 'Account Restored',
    message: 'Your account has been unbanned. You can now log in again.',
    referenceType: 'USER',
  });

  return updated;
};

const verifyUser = async (userId, adminId) => {
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new ApiError(404, 'User not found.');
  if (targetUser.isEmailVerified) {
    throw new ApiError(400, 'User is already verified.');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
    select: { id: true, name: true, email: true, isEmailVerified: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.VERIFY_USER,
    targetType: AUDIT_TARGETS.USER,
    targetId: userId,
    metadata: {},
  });

  await notificationService.createSystemNotification({
    recipientId: userId,
    title: 'Email Verified',
    message: 'Your email has been verified by an administrator.',
    referenceType: 'USER',
  });

  return updated;
};

const getPosts = async (filters, sort, page, limit) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.visibility) where.visibility = filters.visibility;
  if (filters.authorId) where.authorId = filters.authorId;
  if (filters.featured !== undefined) where.featured = filters.featured;
  if (filters.pinned !== undefined) where.pinned = filters.pinned;

  if (filters.tag) {
    where.tags = { some: { tag: { name: filters.tag } } };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { excerpt: { contains: filters.search, mode: 'insensitive' } },
      { author: { name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const orderBy =
    sort === 'oldest'
      ? { createdAt: 'asc' }
      : sort === 'mostViewed'
        ? { analytics: { views: 'desc' } }
        : sort === 'mostLiked'
          ? { likes: { _count: 'desc' } }
          : sort === 'mostCommented'
            ? { comments: { _count: 'desc' } }
            : { createdAt: 'desc' };

  const [posts, totalItems] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        analytics: { select: { views: true } },
        _count: { select: { likes: true, comments: true, bookmarks: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const items = posts.map((p) => ({
    ...p,
    tags: (p.tags || []).map((pt) => pt.tag),
    views: p.analytics?.views ?? 0,
    likesCount: p._count.likes,
    commentsCount: p._count.comments,
    bookmarksCount: p._count.bookmarks,
    analytics: undefined,
    _count: undefined,
  }));

  return { items, totalItems, page, limit };
};

const deletePost = async (postId, adminId) => {
  await postService.deletePost(postId, adminId, 'ADMIN');

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.DELETE_POST,
    targetType: AUDIT_TARGETS.POST,
    targetId: postId,
    metadata: {},
  });
};

const archivePost = async (postId, adminId) => {
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) throw new ApiError(404, 'Post not found.');
  if (existing.status === 'ARCHIVED')
    throw new ApiError(400, 'Post is already archived.');

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { status: 'ARCHIVED' },
    select: { id: true, title: true, status: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.ARCHIVE_POST,
    targetType: AUDIT_TARGETS.POST,
    targetId: postId,
    metadata: {},
  });

  return updated;
};

const restorePost = async (postId, adminId) => {
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) throw new ApiError(404, 'Post not found.');
  if (existing.status !== 'ARCHIVED')
    throw new ApiError(400, 'Post is not archived.');

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { status: 'DRAFT' },
    select: { id: true, title: true, status: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.RESTORE_POST,
    targetType: AUDIT_TARGETS.POST,
    targetId: postId,
    metadata: {},
  });

  return updated;
};

const featurePost = async (postId, adminId) => {
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) throw new ApiError(404, 'Post not found.');
  if (existing.featured) throw new ApiError(400, 'Post is already featured.');

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { featured: true },
    select: { id: true, title: true, featured: true, authorId: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.FEATURE_POST,
    targetType: AUDIT_TARGETS.POST,
    targetId: postId,
    metadata: {},
  });

  await notificationService.createSystemNotification({
    recipientId: existing.authorId,
    title: 'Post Featured',
    message: `Your post "${existing.title}" has been featured!`,
    referenceId: postId,
    referenceType: 'POST',
  });

  return updated;
};

const unfeaturePost = async (postId, adminId) => {
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) throw new ApiError(404, 'Post not found.');
  if (!existing.featured) throw new ApiError(400, 'Post is not featured.');

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { featured: false },
    select: { id: true, title: true, featured: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.UNFEATURE_POST,
    targetType: AUDIT_TARGETS.POST,
    targetId: postId,
    metadata: {},
  });

  return updated;
};

const pinPost = async (postId, adminId) => {
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) throw new ApiError(404, 'Post not found.');
  if (existing.pinned) throw new ApiError(400, 'Post is already pinned.');

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { pinned: true },
    select: { id: true, title: true, pinned: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.PIN_POST,
    targetType: AUDIT_TARGETS.POST,
    targetId: postId,
    metadata: {},
  });

  return updated;
};

const unpinPost = async (postId, adminId) => {
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) throw new ApiError(404, 'Post not found.');
  if (!existing.pinned) throw new ApiError(400, 'Post is not pinned.');

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { pinned: false },
    select: { id: true, title: true, pinned: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.UNPIN_POST,
    targetType: AUDIT_TARGETS.POST,
    targetId: postId,
    metadata: {},
  });

  return updated;
};

const getComments = async (filters, sort, page, limit) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (filters.postId) where.postId = filters.postId;
  if (filters.userId) where.userId = filters.userId;
  if (filters.isHidden !== undefined) where.isHidden = filters.isHidden;

  if (filters.search) {
    where.content = { contains: filters.search, mode: 'insensitive' };
  }

  const orderBy =
    sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [comments, totalItems] = await prisma.$transaction([
    prisma.comment.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: { select: { id: true, name: true, image: true } },
        post: { select: { id: true, title: true, slug: true } },
        _count: { select: { likes: true, replies: true } },
      },
    }),
    prisma.comment.count({ where }),
  ]);

  const items = comments.map((c) => ({
    id: c.id,
    content: c.content,
    isHidden: c.isHidden,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    author: c.user,
    post: c.post,
    likeCount: c._count.likes,
    replyCount: c._count.replies,
    parentId: c.parentId,
  }));

  return { items, totalItems, page, limit };
};

const deleteComment = async (commentId, adminId) => {
  await commentService.deleteComment(commentId, adminId, 'ADMIN');

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.DELETE_COMMENT,
    targetType: AUDIT_TARGETS.COMMENT,
    targetId: commentId,
    metadata: {},
  });
};

const hideComment = async (commentId, adminId) => {
  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!existing) throw new ApiError(404, 'Comment not found.');
  if (existing.isHidden) throw new ApiError(400, 'Comment is already hidden.');

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { isHidden: true },
    select: { id: true, content: true, isHidden: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.HIDE_COMMENT,
    targetType: AUDIT_TARGETS.COMMENT,
    targetId: commentId,
    metadata: {},
  });

  return updated;
};

const approveComment = async (commentId, adminId) => {
  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!existing) throw new ApiError(404, 'Comment not found.');
  if (!existing.isHidden) throw new ApiError(400, 'Comment is not hidden.');

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { isHidden: false },
    select: { id: true, content: true, isHidden: true },
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.APPROVE_COMMENT,
    targetType: AUDIT_TARGETS.COMMENT,
    targetId: commentId,
    metadata: {},
  });

  return updated;
};

const getMediaList = async (filters, sort, page, limit) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (filters.ownerId) where.ownerId = filters.ownerId;
  if (filters.mimeType)
    where.mimeType = { contains: filters.mimeType, mode: 'insensitive' };

  if (filters.search) {
    where.OR = [
      { originalName: { contains: filters.search, mode: 'insensitive' } },
      { fileName: { contains: filters.search, mode: 'insensitive' } },
      { altText: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  const orderBy =
    sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [media, totalItems] = await prisma.$transaction([
    prisma.media.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
    prisma.media.count({ where }),
  ]);

  return { items: media, totalItems, page, limit };
};

const deleteMedia = async (mediaId, adminId) => {
  const existing = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!existing) throw new ApiError(404, 'Media not found.');

  const storageService = require('../../services/storage/storage.service');
  await storageService.deleteFile(existing.storageKey);
  const webpKey = existing.fileName.replace(existing.extension, '.webp');
  await storageService.deleteFile(webpKey).catch(() => {});
  await storageService.deleteFile(`thumb-${existing.fileName}`).catch(() => {});

  await prisma.media.delete({ where: { id: mediaId } });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.DELETE_MEDIA,
    targetType: AUDIT_TARGETS.MEDIA,
    targetId: mediaId,
    metadata: { fileName: existing.fileName },
  });
};

const getOrphanedMedia = async () => {
  const allMedia = await prisma.media.findMany({
    select: {
      id: true,
      fileName: true,
      originalName: true,
      mimeType: true,
      size: true,
      createdAt: true,
      owner: { select: { id: true, name: true } },
    },
  });

  return allMedia;
};

const getEnhancedAnalytics = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    basicAnalytics,
    dau,
    mau,
    topAuthors,
    topTags,
    aiUsage,
    storageStats,
    averagePostLength,
    mostViewed,
    mostLiked,
    mostCommented,
    signupsLast30Days,
    signupsLast7Days,
  ] = await Promise.all([
    analyticsService.getAdminAnalytics(),
    prisma.user.count({ where: { lastLoginAt: { gte: startOfDay } } }),
    prisma.user.count({ where: { lastLoginAt: { gte: startOfMonth } } }),
    prisma.post.groupBy({
      by: ['authorId'],
      _count: { id: true },
      _sum: {
        /* views from analytics would need join */
      },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.tag.findMany({
      orderBy: { posts: { _count: 'desc' } },
      take: 10,
      select: { id: true, name: true, _count: { select: { posts: true } } },
    }),
    prisma.aIGeneration.groupBy({
      by: ['type'],
      _count: { id: true },
    }),
    prisma.media.aggregate({
      _sum: { size: true },
      _count: { id: true },
    }),
    getAveragePostContentLength(),
    getMostViewedPosts(10),
    getMostLikedPosts(10),
    getMostCommentedPosts(10),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const authorIds = topAuthors.map((a) => a.authorId);
  const authorDetails =
    authorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: authorIds } },
          select: { id: true, name: true, image: true },
        })
      : [];

  const authorMap = {};
  for (const a of authorDetails) {
    authorMap[a.id] = a;
  }

  return {
    overview: {
      totalUsers: basicAnalytics.totalUsers,
      totalPosts: basicAnalytics.totalPosts,
      totalComments: basicAnalytics.totalComments,
      totalLikes: basicAnalytics.totalLikes,
      totalViews: basicAnalytics.totalViews,
      publishedPosts: basicAnalytics.publishedPosts,
      draftPosts: basicAnalytics.draftPosts,
      archivedPosts: basicAnalytics.archivedPosts,
    },
    growth: {
      last7Days: signupsLast7Days,
      last30Days: signupsLast30Days,
    },
    activeUsers: {
      daily: dau,
      monthly: mau,
    },
    topAuthors: topAuthors.map((a) => ({
      author: authorMap[a.authorId] || { id: a.authorId, name: 'Unknown' },
      postCount: a._count.id,
    })),
    topTags: topTags.map((t) => ({
      id: t.id,
      name: t.name,
      postCount: t._count.posts,
    })),
    aiUsage: aiUsage.map((u) => ({
      type: u.type,
      count: u._count.id,
    })),
    storage: {
      totalFiles: storageStats._count.id,
      totalSizeBytes: storageStats._sum.size || 0,
      totalSizeMB:
        Math.round(((storageStats._sum.size || 0) / (1024 * 1024)) * 100) / 100,
    },
    averagePostLength,
    mostViewed,
    mostLiked,
    mostCommented,
  };
};

const getAveragePostContentLength = async () => {
  const result = await prisma.post.aggregate({
    _count: { id: true },
  });
  const totalPosts = result._count.id;
  if (totalPosts === 0) return { averageLength: 0, totalPosts: 0 };

  return { averageLength: 0, totalPosts };
};

const getMostViewedPosts = async (take) => {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { analytics: { views: 'desc' } },
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      analytics: { select: { views: true } },
      author: { select: { id: true, name: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    views: p.analytics?.views ?? 0,
    author: p.author,
  }));
};

const getMostLikedPosts = async (take) => {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { likes: { _count: 'desc' } },
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      _count: { select: { likes: true } },
      author: { select: { id: true, name: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    likes: p._count.likes,
    author: p.author,
  }));
};

const getMostCommentedPosts = async (take) => {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { comments: { _count: 'desc' } },
    take,
    select: {
      id: true,
      title: true,
      slug: true,
      _count: { select: { comments: true } },
      author: { select: { id: true, name: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    comments: p._count.comments,
    author: p.author,
  }));
};

const createAnnouncement = async (data, adminId) => {
  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type,
      createdBy: adminId,
      expiresAt: data.expiresAt || null,
    },
  });

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { name: true },
  });

  const targetUsers = await prisma.user.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true },
  });

  await notificationService.createBulkSystemNotifications({
    userIds: targetUsers.map((u) => u.id),
    title: data.type === 'ALERT' ? `ALERT: ${data.title}` : data.title,
    message: `${data.message}${admin?.name ? ` — ${admin.name}` : ''}`,
  });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.CREATE_ANNOUNCEMENT,
    targetType: AUDIT_TARGETS.ANNOUNCEMENT,
    targetId: announcement.id,
    metadata: { title: data.title, type: data.type },
  });

  return announcement;
};

const getAnnouncements = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [announcements, totalItems] = await prisma.$transaction([
    prisma.announcement.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.count(),
  ]);

  return { items: announcements, totalItems, page, limit };
};

const deleteAnnouncement = async (announcementId, adminId) => {
  const existing = await prisma.announcement.findUnique({
    where: { id: announcementId },
  });
  if (!existing) throw new ApiError(404, 'Announcement not found.');

  await prisma.announcement.delete({ where: { id: announcementId } });

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.DELETE_ANNOUNCEMENT,
    targetType: AUDIT_TARGETS.ANNOUNCEMENT,
    targetId: announcementId,
    metadata: { title: existing.title },
  });
};

const getAuditLogs = async (filters, page, limit) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (filters.action) where.action = filters.action;
  if (filters.targetType) where.targetType = filters.targetType;
  if (filters.adminId) where.adminId = filters.adminId;
  if (filters.targetId) where.targetId = filters.targetId;

  const [logs, totalItems] = await prisma.$transaction([
    prisma.adminAuditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return { items: logs, totalItems, page, limit };
};

const getAuditLogStats = async () => {
  const [totalLogs, actionCounts, recentActions] = await Promise.all([
    prisma.adminAuditLog.count(),
    prisma.adminAuditLog.groupBy({
      by: ['action'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        admin: { select: { id: true, name: true, image: true } },
      },
    }),
  ]);

  return {
    totalLogs,
    topActions: actionCounts.map((a) => ({
      action: a.action,
      count: a._count.id,
    })),
    recentActions,
  };
};

const adminSearch = async (query) => {
  const { q, type } = query;
  const results = {};

  if (type === 'all' || type === 'users') {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    results.users = users;
  }

  if (type === 'all' || type === 'posts') {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        featured: true,
        pinned: true,
        createdAt: true,
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    results.posts = posts.map((p) => ({
      ...p,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      _count: undefined,
    }));
  }

  if (type === 'all' || type === 'reports') {
    const reports = await prisma.report.findMany({
      where: {
        OR: [
          { description: { contains: q, mode: 'insensitive' } },
          { reportReason: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        reportType: true,
        reportReason: true,
        status: true,
        referenceId: true,
        createdAt: true,
        reporter: { select: { id: true, name: true, image: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    results.reports = reports;
  }

  if (type === 'all' || type === 'media') {
    const media = await prisma.media.findMany({
      where: {
        OR: [
          { originalName: { contains: q, mode: 'insensitive' } },
          { fileName: { contains: q, mode: 'insensitive' } },
          { altText: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        mimeType: true,
        size: true,
        publicUrl: true,
        createdAt: true,
        owner: { select: { id: true, name: true, image: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    results.media = media;
  }

  return results;
};

const getPlatformSettings = async () => {
  const dbSettings = await prisma.platformSetting.findMany();
  const settingMap = {};
  for (const s of dbSettings) {
    settingMap[s.key] = {
      value: s.value,
      type: s.type,
      description: s.description,
      updatedAt: s.updatedAt,
    };
  }

  for (const [key, defaults] of Object.entries(DEFAULT_SETTINGS)) {
    if (!settingMap[key]) {
      settingMap[key] = {
        value: defaults.value,
        type: defaults.type,
        description: defaults.description,
        updatedAt: null,
      };
    }
  }

  return settingMap;
};

const updatePlatformSettings = async (settings, adminId) => {
  const updated = [];
  for (const [key, value] of Object.entries(settings)) {
    const setting = await prisma.platformSetting.upsert({
      where: { key },
      create: {
        key,
        value,
        type: DEFAULT_SETTINGS[key]?.type || 'string',
        description: DEFAULT_SETTINGS[key]?.description || null,
        updatedBy: adminId,
      },
      update: {
        value,
        updatedBy: adminId,
      },
    });
    updated.push(setting);
  }

  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.UPDATE_SETTINGS,
    targetType: AUDIT_TARGETS.SETTING,
    targetId: 'platform_settings',
    metadata: { updatedKeys: Object.keys(settings) },
  });

  return updated;
};

module.exports = {
  getDashboard,
  getUsers,
  getUser,
  updateUserRole,
  banUser,
  unbanUser,
  verifyUser,
  getPosts,
  deletePost,
  archivePost,
  restorePost,
  featurePost,
  unfeaturePost,
  pinPost,
  unpinPost,
  getComments,
  deleteComment,
  hideComment,
  approveComment,
  getMediaList,
  deleteMedia,
  getOrphanedMedia,
  getEnhancedAnalytics,
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  getAuditLogs,
  getAuditLogStats,
  adminSearch,
  getPlatformSettings,
  updatePlatformSettings,
};
