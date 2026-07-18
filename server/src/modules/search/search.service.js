const prisma = require('../../config/db');
const {
  buildPagination,
  rankPosts,
  rankUsers,
  sortRankedResults,
  getPostVisibilityFilter,
} = require('./search.utils');
const {
  SUGGESTION_LIMIT,
  TRENDING_LIMIT,
  HISTORY_LIMIT,
  SEARCH_SORT,
} = require('./search.constants');

const postSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  createdAt: true,
  publishedAt: true,
  author: {
    select: { id: true, name: true, image: true },
  },
  tags: {
    include: { tag: { select: { id: true, name: true } } },
  },
  analytics: { select: { views: true } },
  _count: { select: { likes: true } },
};

const userSelect = {
  id: true,
  name: true,
  image: true,
  createdAt: true,
  _count: { select: { posts: true, followers: true } },
};

const tagSelect = {
  id: true,
  name: true,
  _count: { select: { posts: true } },
};

const formatPost = (post) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  tags: (post.tags || []).map((pt) => pt.tag),
  author: post.author,
  views: post.analytics?.views || 0,
  likesCount: post._count?.likes || 0,
  createdAt: post.createdAt,
  publishedAt: post.publishedAt,
});

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  image: user.image,
  postsCount: user._count?.posts || 0,
  followersCount: user._count?.followers || 0,
  createdAt: user.createdAt,
});

const formatTag = (tag) => ({
  id: tag.id,
  name: tag.name,
  postCount: tag._count?.posts || 0,
});

const buildPostWhere = (query, user) => {
  const { q, tag, author, dateFrom, dateTo } = query;
  const visibility = getPostVisibilityFilter(user);
  const conditions = [
    { status: visibility.status },
    { visibility: visibility.visibility },
  ];

  if (q) {
    conditions.push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { content: { path: ['$'], string_contains: q } },
        {
          tags: {
            some: { tag: { name: { contains: q, mode: 'insensitive' } } },
          },
        },
      ],
    });
  }

  if (tag) {
    conditions.push({ tags: { some: { tag: { name: tag.toLowerCase() } } } });
  }

  if (author) {
    conditions.push({
      OR: [
        { author: { name: { contains: author, mode: 'insensitive' } } },
        { author: { email: { contains: author, mode: 'insensitive' } } },
      ],
    });
  }

  if (dateFrom || dateTo) {
    const dateFilter = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);
    conditions.push({ publishedAt: dateFilter });
  }

  return { AND: conditions };
};

const getPostOrderBy = (sort) => {
  switch (sort) {
    case SEARCH_SORT.OLDEST:
      return { createdAt: 'asc' };
    case SEARCH_SORT.MOST_VIEWED:
      return { analytics: { views: 'desc' } };
    case SEARCH_SORT.MOST_LIKED:
      return { likes: { _count: 'desc' } };
    case SEARCH_SORT.NEWEST:
    default:
      return { createdAt: 'desc' };
  }
};

const searchPosts = async (query, page, limit, sort, user) => {
  const where = buildPostWhere(query, user);

  if (sort === SEARCH_SORT.RELEVANCE) {
    const allMatching = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        excerpt: true,
        content: true,
        createdAt: true,
        tags: {
          include: { tag: { select: { id: true, name: true } } },
        },
      },
    });

    const ranked = rankPosts(allMatching, query.q);
    const sorted = sortRankedResults(ranked);
    const totalItems = sorted.length;
    const paged = sorted.slice((page - 1) * limit, page * limit);

    if (paged.length === 0) {
      return { results: [], pagination: buildPagination(0, page, limit) };
    }

    const pagedIds = paged.map((p) => p.id);
    const posts = await prisma.post.findMany({
      where: { id: { in: pagedIds } },
      select: postSelect,
    });

    const idOrder = pagedIds.reduce((map, id, idx) => {
      map[id] = idx;
      return map;
    }, {});
    posts.sort((a, b) => idOrder[a.id] - idOrder[b.id]);

    return {
      results: posts.map(formatPost),
      pagination: buildPagination(totalItems, page, limit),
    };
  }

  const orderBy = getPostOrderBy(sort);
  const skip = (page - 1) * limit;

  const [posts, totalItems] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: postSelect,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    results: posts.map(formatPost),
    pagination: buildPagination(totalItems, page, limit),
  };
};

const searchUsers = async (query, page, limit, sort) => {
  const { q } = query;
  const where = {
    OR: [{ name: { contains: q, mode: 'insensitive' } }],
  };

  if (sort === SEARCH_SORT.RELEVANCE) {
    const allMatching = await prisma.user.findMany({
      where,
      select: { id: true, name: true, createdAt: true },
    });

    const ranked = rankUsers(allMatching, q);
    const sorted = sortRankedResults(ranked);
    const totalItems = sorted.length;
    const paged = sorted.slice((page - 1) * limit, page * limit);

    if (paged.length === 0) {
      return { results: [], pagination: buildPagination(0, page, limit) };
    }

    const pagedIds = paged.map((u) => u.id);
    const users = await prisma.user.findMany({
      where: { id: { in: pagedIds } },
      select: userSelect,
    });

    const idOrder = pagedIds.reduce((map, id, idx) => {
      map[id] = idx;
      return map;
    }, {});
    users.sort((a, b) => idOrder[a.id] - idOrder[b.id]);

    return {
      results: users.map(formatUser),
      pagination: buildPagination(totalItems, page, limit),
    };
  }

  const skip = (page - 1) * limit;
  const orderBy =
    sort === SEARCH_SORT.OLDEST ? { createdAt: 'asc' } : { createdAt: 'desc' };

  const [users, totalItems] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: userSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    results: users.map(formatUser),
    pagination: buildPagination(totalItems, page, limit),
  };
};

const searchTags = async (query, page, limit, sort) => {
  const { q } = query;
  const where = {
    name: { contains: q, mode: 'insensitive' },
  };

  const skip = (page - 1) * limit;
  const orderBy =
    sort === SEARCH_SORT.OLDEST
      ? { name: 'asc' }
      : { posts: { _count: 'desc' } };

  const [tags, totalItems] = await prisma.$transaction([
    prisma.tag.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: tagSelect,
    }),
    prisma.tag.count({ where }),
  ]);

  return {
    results: tags.map(formatTag),
    pagination: buildPagination(totalItems, page, limit),
  };
};

const globalSearch = async (query, user) => {
  const { type, sort, page, limit } = query;

  const result = {
    posts: [],
    users: [],
    tags: [],
    pagination: null,
  };

  if (type === 'all' || type === 'posts') {
    const { results, pagination } = await searchPosts(
      query,
      page,
      limit,
      sort,
      user
    );
    result.posts = results;
    result.pagination = pagination;
  }

  if (type === 'all' || type === 'users') {
    const { results, pagination } = await searchUsers(query, page, limit, sort);
    result.users = results;
    if (!result.pagination) result.pagination = pagination;
  }

  if (type === 'all' || type === 'tags') {
    const { results, pagination } = await searchTags(query, page, limit, sort);
    result.tags = results;
    if (!result.pagination) result.pagination = pagination;
  }

  return result;
};

const getSuggestions = async (q) => {
  const [posts, users, tags] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        title: { startsWith: q, mode: 'insensitive' },
      },
      select: { id: true, title: true, slug: true, excerpt: true },
      take: SUGGESTION_LIMIT,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.user.findMany({
      where: {
        name: { startsWith: q, mode: 'insensitive' },
      },
      select: { id: true, name: true, image: true },
      take: SUGGESTION_LIMIT,
    }),
    prisma.tag.findMany({
      where: {
        name: { startsWith: q.toLowerCase(), mode: 'insensitive' },
      },
      select: { id: true, name: true },
      take: SUGGESTION_LIMIT,
    }),
  ]);

  return { posts, users, tags };
};

const getTrending = async () => {
  const trending = await prisma.trendingSearch.findMany({
    orderBy: { count: 'desc' },
    take: TRENDING_LIMIT,
    select: { keyword: true, count: true },
  });
  return trending;
};

const recordTrending = async (keyword) => {
  try {
    await prisma.trendingSearch.upsert({
      where: { keyword },
      create: { keyword, count: 1 },
      update: { count: { increment: 1 } },
    });
  } catch {
    // Silently handle — trending recording should never break search
  }
};

const getHistory = async (userId) => {
  const history = await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_LIMIT,
    select: { id: true, query: true, createdAt: true },
  });
  return history;
};

const recordHistory = async (userId, query) => {
  if (!userId) return;
  await prisma.searchHistory.create({
    data: { userId, query },
  });
};

const deleteHistory = async (userId) => {
  await prisma.searchHistory.deleteMany({ where: { userId } });
};

const getPopularTags = async () => {
  const tags = await prisma.tag.findMany({
    orderBy: { posts: { _count: 'desc' } },
    take: TRENDING_LIMIT,
    select: {
      id: true,
      name: true,
      _count: { select: { posts: true } },
    },
  });
  return tags.map(formatTag);
};

const getDiscoverAuthors = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const authors = await prisma.user.findMany({
    where: {
      posts: { some: { status: 'PUBLISHED' } },
    },
    orderBy: [{ followers: { _count: 'desc' } }, { posts: { _count: 'desc' } }],
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      image: true,
      _count: {
        select: {
          posts: { where: { status: 'PUBLISHED' } },
          followers: true,
        },
      },
    },
  });

  const totalItems = await prisma.user.count({
    where: {
      posts: { some: { status: 'PUBLISHED' } },
    },
  });

  return {
    authors: authors.map((author) => ({
      id: author.id,
      name: author.name,
      image: author.image,
      postsCount: author._count.posts,
      followersCount: author._count.followers,
    })),
    pagination: buildPagination(totalItems, page, limit),
  };
};

module.exports = {
  globalSearch,
  getSuggestions,
  getTrending,
  recordTrending,
  getHistory,
  recordHistory,
  deleteHistory,
  getPopularTags,
  getDiscoverAuthors,
  searchPosts,
  searchUsers,
  searchTags,
};
