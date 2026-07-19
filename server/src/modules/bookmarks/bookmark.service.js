const prisma = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const { BOOKMARK_SORT } = require('./bookmark.constants');

const bookmarkInclude = {
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
      _count: {
        select: { likes: true, comments: true },
      },
    },
  },
};

const formatBookmark = (bookmark) => ({
  id: bookmark.post.id,
  title: bookmark.post.title,
  slug: bookmark.post.slug,
  excerpt: bookmark.post.excerpt,
  author: bookmark.post.author,
  publishedAt: bookmark.post.publishedAt,
  views: bookmark.post.analytics?.views || 0,
  likes: bookmark.post._count?.likes || 0,
  comments: bookmark.post._count?.comments || 0,
  bookmarkedAt: bookmark.createdAt,
});

const getPostVisibilityFilter = (status, visibility) => {
  if (status === 'ARCHIVED') return false;
  if (visibility === 'PRIVATE') return false;
  return true;
};

const bookmarkPost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, status: true, visibility: true },
  });

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  if (!getPostVisibilityFilter(post.status, post.visibility)) {
    throw new ApiError(400, 'Cannot bookmark this post.');
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    throw new ApiError(409, 'Post already bookmarked.');
  }

  await prisma.bookmark.create({
    data: { userId, postId },
  });

  return { bookmarked: true };
};

const removeBookmark = async (postId, userId) => {
  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (!existing) {
    throw new ApiError(404, 'Bookmark not found.');
  }

  await prisma.bookmark.delete({
    where: { id: existing.id },
  });

  return { bookmarked: false };
};

const getMyBookmarks = async (userId, { page, limit, sort }) => {
  const skip = (page - 1) * limit;

  const orderBy =
    sort === BOOKMARK_SORT.OLDEST
      ? { createdAt: 'asc' }
      : { createdAt: 'desc' };

  const where = { userId };

  const [bookmarks, totalItems] = await prisma.$transaction([
    prisma.bookmark.findMany({
      where,
      include: bookmarkInclude,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.bookmark.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    posts: bookmarks.map(formatBookmark),
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getBookmarkStatus = async (postId, userId) => {
  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { id: true },
  });

  return { isBookmarked: !!bookmark };
};

module.exports = {
  bookmarkPost,
  removeBookmark,
  getMyBookmarks,
  getBookmarkStatus,
};
