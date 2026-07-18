const { MIN_SEARCH_LENGTH } = require('./search.constants');

const sanitizeQuery = (q) => {
  if (!q || typeof q !== 'string') return '';
  return q.trim().replace(/\s+/g, ' ');
};

const isValidSearchQuery = (q) => {
  const sanitized = sanitizeQuery(q);
  return sanitized.length >= MIN_SEARCH_LENGTH;
};

const buildPagination = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

const rankPosts = (posts, query) => {
  const lowerQuery = query.toLowerCase();

  return posts.map((post) => {
    let score = 0;
    const title = (post.title || '').toLowerCase();
    const excerpt = (post.excerpt || '').toLowerCase();
    const tagNames = (post.tags || []).map((t) =>
      (t.tag || t).name.toLowerCase()
    );

    if (title === lowerQuery) score += 100;
    else if (title.startsWith(lowerQuery)) score += 80;
    else if (title.includes(lowerQuery)) score += 60;

    if (tagNames.some((t) => t.includes(lowerQuery))) score += 40;

    if (excerpt.includes(lowerQuery)) score += 20;

    const contentRaw = post.content;
    if (contentRaw) {
      const contentStr =
        typeof contentRaw === 'string'
          ? contentRaw
          : JSON.stringify(contentRaw);
      if (contentStr.toLowerCase().includes(lowerQuery)) score += 10;
    }

    return { ...post, _score: score };
  });
};

const rankUsers = (users, query) => {
  const lowerQuery = query.toLowerCase();

  return users.map((user) => {
    let score = 0;
    const name = (user.name || '').toLowerCase();

    if (name === lowerQuery) score += 100;
    else if (name.startsWith(lowerQuery)) score += 80;
    else if (name.includes(lowerQuery)) score += 60;

    return { ...user, _score: score };
  });
};

const sortRankedResults = (items) => {
  return items.sort((a, b) => {
    const scoreDiff = (b._score || 0) - (a._score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
};

const getPostVisibilityFilter = (user) => {
  const base = { status: 'PUBLISHED', visibility: 'PUBLIC' };
  return base;
};

module.exports = {
  sanitizeQuery,
  isValidSearchQuery,
  buildPagination,
  rankPosts,
  rankUsers,
  sortRankedResults,
  getPostVisibilityFilter,
};
