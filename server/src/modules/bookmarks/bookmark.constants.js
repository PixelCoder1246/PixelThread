const BOOKMARK_SORT = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
};

const BOOKMARK_SORT_VALUES = Object.values(BOOKMARK_SORT);

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

module.exports = {
  BOOKMARK_SORT,
  BOOKMARK_SORT_VALUES,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
