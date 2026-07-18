const ApiError = require('../../utils/ApiError');
const {
  SEARCH_TYPE_VALUES,
  SEARCH_SORT_VALUES,
  MIN_SEARCH_LENGTH,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} = require('./search.constants');
const { sanitizeQuery } = require('./search.utils');

const validateSearchQuery = (query) => {
  const {
    q,
    type: rawType,
    sort: rawSort,
    tag,
    author,
    dateFrom,
    dateTo,
  } = query;

  let sanitized = sanitizeQuery(q);
  if (!sanitized || sanitized.length < MIN_SEARCH_LENGTH) {
    throw new ApiError(
      400,
      `Search query must be at least ${MIN_SEARCH_LENGTH} characters.`
    );
  }

  const type = rawType || 'all';
  if (!SEARCH_TYPE_VALUES.includes(type)) {
    throw new ApiError(
      400,
      `Type must be one of: ${SEARCH_TYPE_VALUES.join(', ')}.`
    );
  }

  const sort = rawSort || 'relevance';
  if (!SEARCH_SORT_VALUES.includes(sort)) {
    throw new ApiError(
      400,
      `Sort must be one of: ${SEARCH_SORT_VALUES.join(', ')}.`
    );
  }

  let page = parseInt(query.page, 10) || DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > MAX_LIMIT) {
    throw new ApiError(400, `Limit must be between 1 and ${MAX_LIMIT}.`);
  }

  if (dateFrom && isNaN(Date.parse(dateFrom))) {
    throw new ApiError(400, 'Invalid dateFrom format.');
  }
  if (dateTo && isNaN(Date.parse(dateTo))) {
    throw new ApiError(400, 'Invalid dateTo format.');
  }

  return {
    q: sanitized,
    type,
    sort,
    page,
    limit,
    tag: tag || undefined,
    author: author || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };
};

const validateSuggestionsQuery = (query) => {
  const q = sanitizeQuery(query.q);
  if (!q || q.length < MIN_SEARCH_LENGTH) {
    throw new ApiError(
      400,
      `Query must be at least ${MIN_SEARCH_LENGTH} characters.`
    );
  }
  return { q };
};

const validatePagination = (query) => {
  let page = parseInt(query.page, 10) || DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  if (page < 1) throw new ApiError(400, 'Page must be a positive integer.');
  if (limit < 1 || limit > MAX_LIMIT) {
    throw new ApiError(400, `Limit must be between 1 and ${MAX_LIMIT}.`);
  }

  return { page, limit };
};

module.exports = {
  validateSearchQuery,
  validateSuggestionsQuery,
  validatePagination,
};
