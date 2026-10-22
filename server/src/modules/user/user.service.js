const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const authorSelect = {
  id: true,
  name: true,
  image: true,
};

const postInclude = {
  author: { select: authorSelect },
  tags: {
    include: {
      tag: {
        select: { id: true, name: true },
      },
    },
  },
  analytics: {
    select: { views: true },
  },
};

const formatPost = (post) => ({
  ...post,
  tags: (post.tags || []).map((pt) => pt.tag),
});

const getUserPosts = async ({ userId, page, limit, sort, currentUserId }) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: userId }, { username: userId }],
      isActive: true,
    },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isOwner = currentUserId === user.id;

  const where = {
    authorId: user.id,
    ...(isOwner ? {} : { status: 'PUBLISHED', visibility: 'PUBLIC' }),
  };

  const skip = (page - 1) * limit;
  const orderBy =
    sort === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [posts, totalItems] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: postInclude,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    posts: posts.map(formatPost),
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getUserProfile = async (idOrUsername) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: idOrUsername }, { username: idOrUsername }],
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      coverImage: true,
      bio: true,
      location: true,
      website: true,
      socialLinks: true,
      profileVisibility: true,
      createdAt: true,
      _count: {
        select: {
          posts: { where: { status: 'PUBLISHED', visibility: 'PUBLIC' } },
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user;
};

module.exports = { getUserPosts, getUserProfile };
