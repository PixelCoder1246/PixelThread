const AUTH_KEYS = ['auth'] as const;
const POSTS_KEYS = ['posts'] as const;
const COMMENTS_KEYS = ['comments'] as const;
const LIKES_KEYS = ['likes'] as const;
const BOOKMARKS_KEYS = ['bookmarks'] as const;
const FOLLOW_KEYS = ['follow'] as const;
const NOTIFICATIONS_KEYS = ['notifications'] as const;
const SEARCH_KEYS = ['search'] as const;
const TAGS_KEYS = ['tags'] as const;
const USERS_KEYS = ['users'] as const;
const HISTORY_KEYS = ['history'] as const;
const ANALYTICS_KEYS = ['analytics'] as const;
const AI_KEYS = ['ai'] as const;
const SETTINGS_KEYS = ['settings'] as const;
const MEDIA_KEYS = ['media'] as const;

export const queryKeys = {
  auth: {
    me: [...AUTH_KEYS, 'me'] as const,
  },
  posts: {
    all: POSTS_KEYS,
    lists: () => [...POSTS_KEYS, 'list'] as const,
    list: (page: number, limit: number) =>
      [...POSTS_KEYS, 'list', { page, limit }] as const,
    search: (params: Record<string, unknown>) =>
      [...POSTS_KEYS, 'search', params] as const,
    detail: (slug: string) => [...POSTS_KEYS, 'detail', slug] as const,
    myPosts: (page: number, limit: number, sort: string) =>
      [...POSTS_KEYS, 'mine', { page, limit, sort }] as const,
    analytics: (postId: string) =>
      [...POSTS_KEYS, 'analytics', postId] as const,
    seo: (postId: string) => [...POSTS_KEYS, 'seo', postId] as const,
  },
  comments: {
    all: COMMENTS_KEYS,
    list: (postId: string) => [...COMMENTS_KEYS, postId] as const,
    replies: (commentId: string) =>
      [...COMMENTS_KEYS, 'replies', commentId] as const,
  },
  likes: {
    all: LIKES_KEYS,
    postStatus: (postId: string) =>
      [...LIKES_KEYS, 'post', postId, 'status'] as const,
    commentStatus: (commentId: string) =>
      [...LIKES_KEYS, 'comment', commentId, 'status'] as const,
    postLikes: (postId: string, page: number, limit: number) =>
      [...LIKES_KEYS, 'post', postId, { page, limit }] as const,
  },
  bookmarks: {
    all: BOOKMARKS_KEYS,
    list: (page: number, limit: number, sort: string) =>
      [...BOOKMARKS_KEYS, 'list', { page, limit, sort }] as const,
    status: (postId: string) =>
      [...BOOKMARKS_KEYS, 'status', postId] as const,
  },
  follow: {
    all: FOLLOW_KEYS,
    followers: (userId: string, page: number, limit: number) =>
      [...FOLLOW_KEYS, 'followers', userId, { page, limit }] as const,
    following: (userId: string, page: number, limit: number) =>
      [...FOLLOW_KEYS, 'following', userId, { page, limit }] as const,
  },
  notifications: {
    all: NOTIFICATIONS_KEYS,
    list: (page: number, limit: number, filters?: Record<string, unknown>) =>
      [...NOTIFICATIONS_KEYS, 'list', { page, limit, ...filters }] as const,
    unreadCount: [...NOTIFICATIONS_KEYS, 'unreadCount'] as const,
  },
  search: {
    all: SEARCH_KEYS,
    global: (params: Record<string, unknown>) =>
      [...SEARCH_KEYS, 'global', params] as const,
    suggestions: (q: string) =>
      [...SEARCH_KEYS, 'suggestions', q] as const,
    trending: [...SEARCH_KEYS, 'trending'] as const,
    history: [...SEARCH_KEYS, 'history'] as const,
    popularTags: [...SEARCH_KEYS, 'popularTags'] as const,
    authors: (page: number, limit: number) =>
      [...SEARCH_KEYS, 'authors', { page, limit }] as const,
  },
  tags: {
    all: TAGS_KEYS,
    list: (page: number, limit: number, sort: string) =>
      [...TAGS_KEYS, 'list', { page, limit, sort }] as const,
    posts: (name: string, page: number, limit: number) =>
      [...TAGS_KEYS, 'posts', name, { page, limit }] as const,
  },
  users: {
    all: USERS_KEYS,
    posts: (userId: string, page: number, limit: number, sort: string) =>
      [...USERS_KEYS, 'posts', userId, { page, limit, sort }] as const,
    profile: (username: string) =>
      [...USERS_KEYS, 'profile', username] as const,
  },
  history: {
    all: HISTORY_KEYS,
    list: (page: number, limit: number) =>
      [...HISTORY_KEYS, 'list', { page, limit }] as const,
  },
  analytics: {
    all: ANALYTICS_KEYS,
    myOverall: [...ANALYTICS_KEYS, 'myOverall'] as const,
    myPosts: (page: number, limit: number, sort: string) =>
      [...ANALYTICS_KEYS, 'myPosts', { page, limit, sort }] as const,
    topPosts: (limit: number, sort: string) =>
      [...ANALYTICS_KEYS, 'topPosts', { limit, sort }] as const,
  },
  ai: {
    all: AI_KEYS,
  },
  settings: {
    all: SETTINGS_KEYS,
    me: [...SETTINGS_KEYS, 'me'] as const,
  },
  media: {
    all: MEDIA_KEYS,
    list: (page: number, limit: number, sort: string) =>
      [...MEDIA_KEYS, 'list', { page, limit, sort }] as const,
  },
} as const;