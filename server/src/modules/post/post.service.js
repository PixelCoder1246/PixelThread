const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { generateUniqueSlug } = require('../../utils/slug.util');
const { deletePostImages } = require('../../utils/upload.util');

const authorSelect = {
  id: true,
  name: true,
  email: true,
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

const formatPost = (post) => ({
  ...post,
  tags: (post.tags || []).map((pt) => pt.tag),
});

const createPost = async ({
  title,
  content,
  excerpt,
  status,
  visibility,
  tags,
  authorId,
}) => {
  const slug = await generateUniqueSlug(title);

  const tagIds = await resolveTagIds(tags);

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      slug,
      content: content,
      excerpt: excerpt ? excerpt.trim() : null,
      status: status || 'DRAFT',
      visibility: visibility || 'PUBLIC',
      authorId,

      analytics: {
        create: { views: 0 },
      },

      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    include: postInclude,
  });

  return formatPost(post);
};

const getAllPosts = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const where = {
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
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

  return {
    posts: posts.map(formatPost),
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

const getPostBySlug = async (slug) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: postInclude,
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  return formatPost(post);
};

const getPostById = async (id) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: postInclude,
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  return formatPost(post);
};

const updatePost = async (postId, data, userId, userRole) => {
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) {
    throw new ApiError(404, 'Post not found.');
  }

  if (existing.authorId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(403, 'You do not have permission to update this post.');
  }

  const updateData = {};

  if (data.title !== undefined) {
    updateData.title = data.title.trim();

    if (data.title.trim() !== existing.title) {
      updateData.slug = await generateUniqueSlug(data.title, postId);
    }
  }

  if (data.content !== undefined) updateData.content = data.content;
  if (data.excerpt !== undefined)
    updateData.excerpt = data.excerpt ? data.excerpt.trim() : null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.visibility !== undefined) updateData.visibility = data.visibility;

  if (data.tags !== undefined) {
    const tagIds = await resolveTagIds(data.tags);

    await prisma.postTag.deleteMany({ where: { postId } });

    updateData.tags = {
      create: tagIds.map((tagId) => ({ tagId })),
    };
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    include: postInclude,
  });

  return formatPost(updated);
};

const deletePost = async (postId, userId, userRole) => {
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) {
    throw new ApiError(404, 'Post not found.');
  }

  if (existing.authorId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(403, 'You do not have permission to delete this post.');
  }

  await deletePostImages(existing.content);
  await prisma.post.delete({ where: { id: postId } });
};

const searchPostInclude = {
  author: { select: { id: true, name: true, image: true } },
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

const buildSearchWhere = ({ q, tag, authorId }) => {
  const conditions = [{ status: 'PUBLISHED' }, { visibility: 'PUBLIC' }];

  if (q) {
    conditions.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { content: { path: ['$'], string_contains: q } },
        {
          tags: {
            some: {
              tag: { name: { contains: q, mode: 'insensitive' } },
            },
          },
        },
        {
          author: { name: { contains: q, mode: 'insensitive' } },
        },
      ],
    });
  }

  if (tag) {
    conditions.push({
      tags: { some: { tag: { name: tag.toLowerCase() } } },
    });
  }

  if (authorId) {
    conditions.push({ authorId });
  }

  return { AND: conditions };
};

const getOrderBy = (sort) => {
  switch (sort) {
    case 'oldest':
      return { createdAt: 'asc' };
    case 'mostViewed':
      return { analytics: { views: 'desc' } };
    case 'mostLiked':
      return { likes: { _count: 'desc' } };
    case 'newest':
    default:
      return { createdAt: 'desc' };
  }
};

const searchPosts = async ({ q, tag, authorId, page, limit, sort }) => {
  const skip = (page - 1) * limit;
  const where = buildSearchWhere({ q, tag, authorId });

  if (sort === 'relevance') {
    const lowerQ = q.toLowerCase();

    const allMatching = await prisma.post.findMany({
      where,
      select: { id: true, title: true, excerpt: true, createdAt: true },
    });

    const scored = allMatching.map((p) => ({
      id: p.id,
      score:
        (p.title && p.title.toLowerCase().includes(lowerQ) ? 3 : 0) +
        (p.excerpt && p.excerpt.toLowerCase().includes(lowerQ) ? 2 : 0),
      createdAt: p.createdAt,
    }));

    scored.sort(
      (a, b) =>
        b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime()
    );

    const totalItems = scored.length;
    const pagedIds = scored.slice(skip, skip + limit).map((s) => s.id);

    if (pagedIds.length === 0) {
      return {
        posts: [],
        pagination: {
          totalItems,
          totalPages: 0,
          currentPage: page,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        },
      };
    }

    const posts = await prisma.post.findMany({
      where: { id: { in: pagedIds } },
      include: searchPostInclude,
    });

    const idOrder = pagedIds.reduce((map, id, idx) => {
      map[id] = idx;
      return map;
    }, {});
    posts.sort((a, b) => idOrder[a.id] - idOrder[b.id]);

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
  }

  const orderBy = getOrderBy(sort);

  const [posts, totalItems] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: searchPostInclude,
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

module.exports = {
  createPost,
  getAllPosts,
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
  searchPosts,
};
