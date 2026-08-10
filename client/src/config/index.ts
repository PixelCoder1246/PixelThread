export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
    withCredentials: true,
  },
  auth: {
    tokenRefreshInterval: 14 * 60 * 1000,
    sessionKey: 'pixelthread-session',
  },
  editor: {
    autoSaveInterval: 30_000,
    maxFileSize: 10 * 1024 * 1024,
  },
  search: {
    debounceMs: 300,
    minQueryLength: 2,
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  upload: {
    maxFiles: 10,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
} as const;
