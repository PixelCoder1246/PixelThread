const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');

const resolveTagIds = async (tagNames) => {
  if (!tagNames || tagNames.length === 0) return [];

  const ids = await Promise.all(
    tagNames.map(async (name) => {
      const normalised = name.trim().toLowerCase();
      const tag = await prisma.tag.upsert({
        where: { name: normalised },
        create: { name: normalised },
        update: {},
        select: { id: true },
      });
      return tag.id;
    })
  );

  return ids;
};

const getAllTags = async ({ page, limit, sort }) => {
  const skip = (page - 1) * limit;

  let orderBy;
  if (sort === 'mostUsed') {
    orderBy = { posts: { _count: 'desc' } };
  } else {
    orderBy = { name: 'asc' };
  }

  const [tags, total] = await prisma.$transaction([
    prisma.tag.findMany({
      skip,
      take: limit,
      orderBy,
      include: {
        _count: { select: { posts: true } },
      },
    }),
    prisma.tag.count(),
  ]);

  return {
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      postCount: tag._count.posts,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

const getTagByName = async (name) => {
  const tag = await prisma.tag.findUnique({
    where: { name: name.toLowerCase() },
  });
  if (!tag) {
    throw new ApiError(404, 'Tag not found.');
  }
  return tag;
};

const getTagPosts = async (name, { page, limit }) => {
  const tag = await getTagByName(name);
  const skip = (page - 1) * limit;

  const where = {
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    tags: { some: { tagId: tag.id } },
  };

  const postInclude = {
    author: { select: { id: true, name: true, image: true } },
    tags: {
      include: { tag: { select: { id: true, name: true } } },
    },
    analytics: { select: { views: true } },
  };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: postInclude,
    }),
    prisma.post.count({ where }),
  ]);

  const formatted = posts.map((post) => ({
    ...post,
    tags: post.tags.map((pt) => pt.tag),
  }));

  return {
    tag: { id: tag.id, name: tag.name },
    posts: formatted,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

const createTag = async (name) => {
  const normalised = name.trim().toLowerCase();
  const existing = await prisma.tag.findUnique({
    where: { name: normalised },
  });
  if (existing) {
    throw new ApiError(409, 'Tag already exists.');
  }
  const tag = await prisma.tag.create({
    data: { name: normalised },
  });
  return tag;
};

const deleteTag = async (tagId) => {
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    include: { _count: { select: { posts: true } } },
  });
  if (!tag) {
    throw new ApiError(404, 'Tag not found.');
  }
  if (tag._count.posts > 0) {
    throw new ApiError(400, 'Cannot delete tag that is attached to posts.');
  }
  await prisma.tag.delete({ where: { id: tagId } });
};

module.exports = {
  resolveTagIds,
  getAllTags,
  getTagByName,
  getTagPosts,
  createTag,
  deleteTag,
};
