const SEARCH_TYPES = {
  ALL: 'all',
  POSTS: 'posts',
  USERS: 'users',
  TAGS: 'tags',
};

const SEARCH_TYPE_VALUES = Object.values(SEARCH_TYPES);

const SEARCH_SORT = {
  RELEVANCE: 'relevance',
  NEWEST: 'newest',
  OLDEST: 'oldest',
  MOST_VIEWED: 'mostViewed',
  MOST_LIKED: 'mostLiked',
};

const SEARCH_SORT_VALUES = Object.values(SEARCH_SORT);

const SUGGESTION_LIMIT = 5;
const TRENDING_LIMIT = 10;
const HISTORY_LIMIT = 20;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MIN_SEARCH_LENGTH = 2;
const MAX_LIMIT = 100;

const VISIBILITY_RULES = {
  GUEST: { status: 'PUBLISHED', visibility: 'PUBLIC' },
  AUTHENTICATED: { status: 'PUBLISHED', visibility: 'PUBLIC' },
};

module.exports = {
  SEARCH_TYPES,
  SEARCH_TYPE_VALUES,
  SEARCH_SORT,
  SEARCH_SORT_VALUES,
  SUGGESTION_LIMIT,
  TRENDING_LIMIT,
  HISTORY_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MIN_SEARCH_LENGTH,
  MAX_LIMIT,
  VISIBILITY_RULES,
};
