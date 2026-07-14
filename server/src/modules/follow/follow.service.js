const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const notificationService = require('../notifications/notification.service');

const userSelect = { id: true, name: true, image: true };

const followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new ApiError(400, 'You cannot follow yourself.');
  }

  const followingUser = await prisma.user.findUnique({
    where: { id: followingId },
    select: { id: true },
  });

  if (!followingUser) {
    throw new ApiError(404, 'User not found.');
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    throw new ApiError(409, 'You are already following this user.');
  }

  const [follow] = await prisma.$transaction([
    prisma.follow.create({
      data: { followerId, followingId },
      include: {
        following: { select: userSelect },
      },
    }),
    notificationService
      .createFollowNotification(followingId, followerId)
      .catch(() => {}),
  ]);

  const followerCount = await prisma.follow.count({ where: { followingId } });
  const followingCount = await prisma.follow.count({ where: { followerId } });

  return {
    following: true,
    followerCount,
    followingCount,
  };
};

const unfollowUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new ApiError(400, 'You cannot unfollow yourself.');
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (!existing) {
    throw new ApiError(404, 'You are not following this user.');
  }

  await prisma.follow.delete({
    where: { id: existing.id },
  });

  const followerCount = await prisma.follow.count({ where: { followingId } });
  const followingCount = await prisma.follow.count({ where: { followerId } });

  return {
    following: false,
    followerCount,
    followingCount,
  };
};

const getFollowers = async (userId, page, limit) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const skip = (page - 1) * limit;

  const [follows, totalItems] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: { select: userSelect },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follow.count({ where: { followingId: userId } }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    users: follows.map((f) => f.follower),
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getFollowing = async (userId, page, limit) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const skip = (page - 1) * limit;

  const [follows, totalItems] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: { select: userSelect },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    users: follows.map((f) => f.following),
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getFollowStatus = async (followerId, followingId) => {
  if (!followerId) return { isFollowing: false };

  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { id: true },
  });

  return { isFollowing: !!follow };
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
};
