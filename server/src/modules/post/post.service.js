const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { generateUniqueSlug } = require('../../utils/slug.util');
const { deletePostImages } = require('../../utils/upload.util');

// ---------------------------------------------------------------------------
// Shared Prisma select shapes
// ---------------------------------------------------------------------------

/** Author fields included in post responses */
const authorSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
};

/** Full post include block — author, tags, analytics */
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
    select: { views: true, likes: true },
  },
};

// ---------------------------------------------------------------------------
// Tag helpers
// ---------------------------------------------------------------------------

/**
 * Given an array of tag name strings, upsert each tag (create if missing)
 * and return their IDs.
 * @param {string[]} tagNames
 * @returns {Promise<string[]>} array of tag IDs
 */
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

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/**
 * Flattens the PostTag[] relation into a plain tag array for API responses.
 * Input:  tags: [ { tag: { id, name } }, … ]
 * Output: tags: [ { id, name }, … ]
 */
const formatPost = (post) => ({
  ...post,
  tags: (post.tags || []).map((pt) => pt.tag),
});

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Create a new post.
 * - Auto-generates unique slug from title.
 * - Creates PostAnalytics (views=0, likes=0).
 * - Upserts tags and links via PostTag.
 */
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

  // Resolve / create tags
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

      // Create analytics automatically
      analytics: {
        create: { views: 0, likes: 0 },
      },

      // Link tags through PostTag join table
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    include: postInclude,
  });

  return formatPost(post);
};

/**
 * Get paginated list of posts.
 * Public (no auth): only PUBLISHED + PUBLIC posts.
 * @param {object} options
 * @param {number} options.page
 * @param {number} options.limit
 */
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

/**
 * Get a single post by slug.
 * Returns the post regardless of status/visibility (caller may gate).
 * Throws 404 if not found.
 */
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

/**
 * Get a post by ID (for internal use — update/delete).
 * Throws 404 if not found.
 */
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

/**
 * Update a post.
 * - Re-generates slug if title changes.
 * - Removes old PostTag relations and creates new ones.
 * @param {string}   postId
 * @param {object}   data     - fields to update (all optional)
 * @param {string}   userId   - requesting user's ID
 * @param {string}   userRole - requesting user's role
 */
const updatePost = async (postId, data, userId, userRole) => {
  // Fetch existing post to check ownership
  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) {
    throw new ApiError(404, 'Post not found.');
  }

  // Ownership / admin check
  if (existing.authorId !== userId && userRole !== 'ADMIN') {
    throw new ApiError(403, 'You do not have permission to update this post.');
  }

  const updateData = {};

  if (data.title !== undefined) {
    updateData.title = data.title.trim();
    // Re-generate slug if title changed
    if (data.title.trim() !== existing.title) {
      updateData.slug = await generateUniqueSlug(data.title, postId);
    }
  }

  if (data.content !== undefined) updateData.content = data.content;
  if (data.excerpt !== undefined)
    updateData.excerpt = data.excerpt ? data.excerpt.trim() : null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.visibility !== undefined) updateData.visibility = data.visibility;

  // Handle tags if provided
  if (data.tags !== undefined) {
    const tagIds = await resolveTagIds(data.tags);

    // Remove all existing PostTag relations for this post
    await prisma.postTag.deleteMany({ where: { postId } });

    // Create new PostTag relations
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

/**
 * Delete a post by ID.
 * Cascades to PostTag, PostAnalytics, etc. per Prisma schema.
 * Throws 403 if caller is not owner or admin.
 */
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

module.exports = {
  createPost,
  getAllPosts,
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
};
