const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const {
  NOTIFICATION_TYPES,
  NOTIFICATION_REFERENCE_TYPES,
  NOTIFICATION_MESSAGES,
  NOTIFICATION_TITLES,
} = require('./notification.constants');

const actorSelect = { id: true, name: true, image: true };

const parseMentions = (content) => {
  if (!content || typeof content !== 'string') return [];
  const mentionRegex = /@(\w+)/g;
  const matches = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return [...new Set(matches)];
};

const createNotification = async ({
  recipientId,
  actorId,
  type,
  title,
  message,
  referenceId,
  referenceType,
}) => {
  if (actorId && recipientId === actorId) return null;

  const notification = await prisma.notification.create({
    data: {
      recipientId,
      actorId,
      type,
      title,
      message,
      referenceId,
      referenceType,
    },
    include: {
      actor: { select: actorSelect },
    },
  });

  return notification;
};

const createLikeNotification = async (postId, actorId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, title: true },
  });

  if (!post || post.authorId === actorId) return null;

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { name: true },
  });

  return createNotification({
    recipientId: post.authorId,
    actorId,
    type: NOTIFICATION_TYPES.LIKE,
    title: NOTIFICATION_TITLES.LIKE,
    message: NOTIFICATION_MESSAGES.LIKE(actor.name || 'Someone'),
    referenceId: postId,
    referenceType: NOTIFICATION_REFERENCE_TYPES.POST,
  });
};

const createCommentNotification = async (postId, commentId, actorId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, title: true },
  });

  if (!post || post.authorId === actorId) return null;

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { name: true },
  });

  return createNotification({
    recipientId: post.authorId,
    actorId,
    type: NOTIFICATION_TYPES.COMMENT,
    title: NOTIFICATION_TITLES.COMMENT,
    message: NOTIFICATION_MESSAGES.COMMENT(actor.name || 'Someone'),
    referenceId: commentId,
    referenceType: NOTIFICATION_REFERENCE_TYPES.COMMENT,
  });
};

const createCommentReplyNotification = async (commentId, replyId, actorId) => {
  const parentComment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!parentComment || parentComment.userId === actorId) return null;

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { name: true },
  });

  return createNotification({
    recipientId: parentComment.userId,
    actorId,
    type: NOTIFICATION_TYPES.COMMENT_REPLY,
    title: NOTIFICATION_TITLES.COMMENT_REPLY,
    message: NOTIFICATION_MESSAGES.COMMENT_REPLY(actor.name || 'Someone'),
    referenceId: replyId,
    referenceType: NOTIFICATION_REFERENCE_TYPES.COMMENT,
  });
};

const createFollowNotification = async (followingId, followerId) => {
  if (followingId === followerId) return null;

  const actor = await prisma.user.findUnique({
    where: { id: followerId },
    select: { name: true },
  });

  return createNotification({
    recipientId: followingId,
    actorId: followerId,
    type: NOTIFICATION_TYPES.FOLLOW,
    title: NOTIFICATION_TITLES.FOLLOW,
    message: NOTIFICATION_MESSAGES.FOLLOW(actor.name || 'Someone'),
    referenceId: followerId,
    referenceType: NOTIFICATION_REFERENCE_TYPES.USER,
  });
};

const createMentionNotifications = async (
  content,
  actorId,
  referenceId,
  referenceType
) => {
  const usernames = parseMentions(content);
  if (usernames.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { name: { in: usernames } },
    select: { id: true, name: true },
  });

  if (users.length === 0) return [];

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { name: true },
  });

  const notifications = [];

  for (const user of users) {
    if (user.id === actorId) continue;

    const existing = await prisma.notification.findFirst({
      where: {
        recipientId: user.id,
        actorId,
        type: NOTIFICATION_TYPES.MENTION,
        referenceId,
        referenceType,
      },
    });

    if (existing) continue;

    const notification = await createNotification({
      recipientId: user.id,
      actorId,
      type: NOTIFICATION_TYPES.MENTION,
      title: NOTIFICATION_TITLES.MENTION,
      message: NOTIFICATION_MESSAGES.MENTION(actor.name || 'Someone'),
      referenceId,
      referenceType,
    });

    if (notification) notifications.push(notification);
  }

  return notifications;
};

const getNotifications = async (userId, filters) => {
  const { page = 1, limit = 20, type, isRead } = filters;
  const skip = (page - 1) * limit;

  const where = { recipientId: userId };

  if (type) where.type = type;
  if (isRead !== undefined) where.isRead = isRead;

  const [notifications, totalItems] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: {
        actor: { select: actorSelect },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    notifications,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw new ApiError(404, 'Notification not found.');
  if (notification.recipientId !== userId)
    throw new ApiError(
      403,
      'You can only mark your own notifications as read.'
    );

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
    include: {
      actor: { select: actorSelect },
    },
  });
};

const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });

  return { count: result.count };
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw new ApiError(404, 'Notification not found.');
  if (notification.recipientId !== userId)
    throw new ApiError(403, 'You can only delete your own notifications.');

  await prisma.notification.delete({
    where: { id: notificationId },
  });
};

const deleteAllRead = async (userId) => {
  const result = await prisma.notification.deleteMany({
    where: { recipientId: userId, isRead: true },
  });

  return { count: result.count };
};

const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { recipientId: userId, isRead: false },
  });

  return { count };
};

const createSystemNotification = async ({
  recipientId,
  title,
  message,
  referenceId,
  referenceType,
}) => {
  return createNotification({
    recipientId,
    actorId: null,
    type: NOTIFICATION_TYPES.SYSTEM,
    title,
    message,
    referenceId,
    referenceType: referenceType || NOTIFICATION_REFERENCE_TYPES.SYSTEM,
  });
};

const createBulkSystemNotifications = async ({ userIds, title, message }) => {
  if (!userIds || userIds.length === 0) return [];

  const notifications = await Promise.all(
    userIds.map((recipientId) =>
      createSystemNotification({ recipientId, title, message })
    )
  );

  return notifications.filter(Boolean);
};

module.exports = {
  createNotification,
  createLikeNotification,
  createCommentNotification,
  createCommentReplyNotification,
  createFollowNotification,
  createMentionNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getUnreadCount,
  createSystemNotification,
  createBulkSystemNotifications,
  parseMentions,
};
