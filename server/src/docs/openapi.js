const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'PixelThread API',
    version: '1.0.0',
    description: `AI-powered blogging platform API.

## Authentication
The API uses JWT-based authentication stored in httpOnly cookies.
- \`accessToken\` cookie (15 min expiry) for API access
- \`refreshToken\` cookie (30 day expiry) for token refresh
- Auto-refresh: when access token expires, the server uses the refresh token to issue new tokens transparently

All protected endpoints require a valid access token in the cookie.`,
    contact: {
      name: 'PixelThread Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description:
        'Register, login, logout, token refresh, email verification, password reset',
    },
    { name: 'Users', description: 'User profiles and public user data' },
    { name: 'Profiles', description: 'Profile settings, avatar, cover image' },
    {
      name: 'Settings',
      description:
        'Email, password, privacy, notification and preference settings',
    },
    { name: 'Posts', description: 'CRUD operations for blog posts' },
    { name: 'Media', description: 'File upload and management' },
    {
      name: 'AI',
      description:
        'AI-powered content generation (blog posts, titles, SEO, summaries, etc.)',
    },
    { name: 'Tags', description: 'Tag management for posts' },
    { name: 'Likes', description: 'Like/unlike posts and comments' },
    { name: 'Comments', description: 'Threaded comments and replies' },
    { name: 'Follows', description: 'Follow/unfollow users' },
    {
      name: 'Notifications',
      description: 'User notification management and admin broadcast',
    },
    {
      name: 'Search',
      description: 'Global search, suggestions, trending topics',
    },
    { name: 'Bookmarks', description: 'Bookmark and save posts' },
    { name: 'Reading History', description: 'Reading history management' },
    { name: 'Analytics', description: 'Post and user analytics' },
    { name: 'SEO', description: 'SEO metadata management for posts' },
    { name: 'Reports', description: 'Content reporting and moderation' },
    {
      name: 'Admin',
      description: 'Platform administration (requires ADMIN role)',
    },
    { name: 'System', description: 'Health check, readiness, metrics' },
  ],
  paths: {},
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description:
          'JWT access token stored in httpOnly cookie. Automatically refreshed via refreshToken cookie.',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Alternative: send JWT as Bearer token in Authorization header.',
      },
    },
    schemas: {
      ApiSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          message: {
            type: 'string',
            example: 'Operation completed successfully.',
          },
          data: { type: 'object', nullable: true },
        },
      },
      ApiErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [false] },
          message: {
            type: 'string',
            example: 'Error message describing what went wrong.',
          },
          errors: {
            type: 'array',
            items: { type: 'string' },
            nullable: true,
            example: [
              'Email is required.',
              'Password must be at least 8 characters.',
            ],
          },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [false] },
          message: { type: 'string', example: 'Validation failed.' },
          errors: {
            type: 'array',
            items: { type: 'string' },
            example: [
              'Password must contain at least one uppercase letter.',
              'Email is not valid.',
            ],
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          totalItems: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 10 },
          currentPage: { type: 'integer', example: 1 },
          hasNextPage: { type: 'boolean', example: true },
          hasPreviousPage: { type: 'boolean', example: false },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [true] },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              items: { type: 'array', items: { type: 'object' } },
              pagination: { $ref: '#/components/schemas/Pagination' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx...' },
          name: { type: 'string', nullable: true, example: 'John Doe' },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          image: {
            type: 'string',
            format: 'uri',
            nullable: true,
            example: 'https://example.com/avatar.jpg',
          },
          username: { type: 'string', nullable: true, example: 'johndoe' },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN', 'SUPER_ADMIN'],
            example: 'USER',
          },
          isEmailVerified: { type: 'boolean', example: false },
          isActive: { type: 'boolean', example: true },
          bio: {
            type: 'string',
            nullable: true,
            example: 'Writer and blogger',
          },
          location: {
            type: 'string',
            nullable: true,
            example: 'New York, USA',
          },
          website: {
            type: 'string',
            format: 'uri',
            nullable: true,
            example: 'https://johndoe.com',
          },
          coverImage: { type: 'string', format: 'uri', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', nullable: true },
          image: { type: 'string', nullable: true },
          username: { type: 'string', nullable: true },
          bio: { type: 'string', nullable: true },
          location: { type: 'string', nullable: true },
          website: { type: 'string', nullable: true },
          profileVisibility: {
            type: 'string',
            enum: ['PUBLIC', 'PRIVATE', 'FOLLOWERS_ONLY'],
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx...' },
          title: { type: 'string', example: 'My First Blog Post' },
          slug: { type: 'string', example: 'my-first-blog-post' },
          content: {
            type: 'object',
            description: 'JSON content blocks',
            example: {
              blocks: [{ type: 'paragraph', data: { text: 'Hello world' } }],
            },
          },
          excerpt: {
            type: 'string',
            nullable: true,
            example: 'A brief introduction to my first post.',
          },
          status: {
            type: 'string',
            enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
            example: 'PUBLISHED',
          },
          visibility: {
            type: 'string',
            enum: ['PUBLIC', 'PRIVATE'],
            example: 'PUBLIC',
          },
          featured: { type: 'boolean', example: false },
          pinned: { type: 'boolean', example: false },
          author: { $ref: '#/components/schemas/User' },
          tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } },
          views: { type: 'integer', example: 1523 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          publishedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      PostCreate: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: {
            type: 'string',
            example: 'My New Blog Post',
            minLength: 1,
            maxLength: 200,
          },
          content: {
            type: 'object',
            description: 'JSON content blocks',
            example: {
              blocks: [{ type: 'paragraph', data: { text: 'Content here' } }],
            },
          },
          excerpt: {
            type: 'string',
            maxLength: 500,
            nullable: true,
            example: 'A short excerpt.',
          },
          status: {
            type: 'string',
            enum: ['DRAFT', 'PUBLISHED'],
            default: 'DRAFT',
          },
          visibility: {
            type: 'string',
            enum: ['PUBLIC', 'PRIVATE'],
            default: 'PUBLIC',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            example: ['javascript', 'tutorial'],
          },
        },
      },
      PostUpdate: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          content: { type: 'object' },
          excerpt: { type: 'string', maxLength: 500, nullable: true },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
          visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE'] },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      Tag: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx...' },
          name: { type: 'string', example: 'javascript' },
          postCount: { type: 'integer', example: 42 },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: {
            type: 'string',
            example: 'Great post! Thanks for sharing.',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          author: { $ref: '#/components/schemas/User' },
          likeCount: { type: 'integer', example: 5 },
          isLiked: { type: 'boolean', example: false },
          replies: {
            type: 'array',
            items: { $ref: '#/components/schemas/Comment' },
          },
        },
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: {
            type: 'string',
            enum: [
              'LIKE',
              'COMMENT',
              'COMMENT_REPLY',
              'FOLLOW',
              'POST_PUBLISHED',
              'POST_FEATURED',
              'MENTION',
              'SYSTEM',
            ],
          },
          title: { type: 'string', example: 'New Like' },
          message: { type: 'string', example: 'John liked your post' },
          isRead: { type: 'boolean', example: false },
          referenceId: { type: 'string', nullable: true },
          referenceType: {
            type: 'string',
            nullable: true,
            enum: ['POST', 'COMMENT', 'USER', 'SYSTEM'],
          },
          actor: { $ref: '#/components/schemas/User', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Media: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fileName: { type: 'string', example: '1689000000-abc123.jpg' },
          originalName: { type: 'string', example: 'photo.jpg' },
          mimeType: { type: 'string', example: 'image/jpeg' },
          extension: { type: 'string', example: '.jpg' },
          size: { type: 'integer', example: 1024000 },
          width: { type: 'integer', nullable: true, example: 1920 },
          height: { type: 'integer', nullable: true, example: 1080 },
          publicUrl: { type: 'string', format: 'uri' },
          altText: {
            type: 'string',
            nullable: true,
            example: 'A beautiful sunset',
          },
          owner: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Bookmark: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          post: { $ref: '#/components/schemas/Post' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Report: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          reportType: { type: 'string', enum: ['POST', 'COMMENT', 'USER'] },
          reportReason: {
            type: 'string',
            enum: [
              'SPAM',
              'HARASSMENT',
              'HATE_SPEECH',
              'MISINFORMATION',
              'COPYRIGHT',
              'ADULT_CONTENT',
              'VIOLENCE',
              'IMPERSONATION',
              'OTHER',
            ],
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'This post contains misinformation.',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
          },
          referenceId: { type: 'string' },
          reporter: { $ref: '#/components/schemas/User' },
          resolver: { $ref: '#/components/schemas/User', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          resolvedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      Analytics: {
        type: 'object',
        properties: {
          views: { type: 'integer', example: 1523 },
          likes: { type: 'integer', example: 89 },
          comments: { type: 'integer', example: 12 },
        },
      },
      UserAnalytics: {
        type: 'object',
        properties: {
          totalPosts: { type: 'integer' },
          publishedPosts: { type: 'integer' },
          draftPosts: { type: 'integer' },
          archivedPosts: { type: 'integer' },
          totalViews: { type: 'integer' },
          totalLikes: { type: 'integer' },
          totalComments: { type: 'integer' },
          averageViewsPerPost: { type: 'integer' },
          averageLikesPerPost: { type: 'integer' },
        },
      },
      AdminDashboard: {
        type: 'object',
        properties: {
          users: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 1523 },
              verified: { type: 'integer', example: 1410 },
              unverified: { type: 'integer', example: 113 },
              banned: { type: 'integer', example: 12 },
              newToday: { type: 'integer', example: 15 },
            },
          },
          posts: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 8540 },
              published: { type: 'integer', example: 7802 },
              drafts: { type: 'integer', example: 532 },
              archived: { type: 'integer', example: 206 },
              today: { type: 'integer', example: 48 },
            },
          },
          engagement: {
            type: 'object',
            properties: {
              likes: { type: 'integer', example: 185432 },
              comments: { type: 'integer', example: 32481 },
              views: { type: 'integer', example: 2958452 },
              bookmarks: { type: 'integer', example: 42131 },
              followers: { type: 'integer', example: 16452 },
            },
          },
          reports: {
            type: 'object',
            properties: {
              pending: { type: 'integer', example: 12 },
              underReview: { type: 'integer', example: 4 },
              resolved: { type: 'integer', example: 241 },
            },
          },
        },
      },
      Announcement: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string', example: 'Scheduled Maintenance' },
          message: {
            type: 'string',
            example: 'The platform will be down for maintenance on Sunday.',
          },
          type: {
            type: 'string',
            enum: ['INFO', 'WARNING', 'ALERT', 'MAINTENANCE'],
            example: 'INFO',
          },
          isActive: { type: 'boolean', example: true },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AuditLogEntry: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          admin: { $ref: '#/components/schemas/User' },
          action: { type: 'string', example: 'BAN_USER' },
          targetType: { type: 'string', example: 'USER' },
          targetId: { type: 'string' },
          metadata: { type: 'object', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      PlatformSettings: {
        type: 'object',
        properties: {
          maintenance_mode: {
            type: 'object',
            properties: {
              value: { type: 'string', example: 'false' },
              type: { type: 'string', example: 'boolean' },
              description: {
                type: 'string',
                example: 'Enable maintenance mode',
              },
            },
          },
          registration_enabled: {
            type: 'object',
            properties: {
              value: { type: 'string', example: 'true' },
              type: { type: 'string', example: 'boolean' },
              description: {
                type: 'string',
                example: 'Allow new user registrations',
              },
            },
          },
          ai_enabled: {
            type: 'object',
            properties: {
              value: { type: 'string', example: 'true' },
              type: { type: 'string', example: 'boolean' },
              description: { type: 'string', example: 'Enable AI features' },
            },
          },
          uploads_enabled: {
            type: 'object',
            properties: {
              value: { type: 'string', example: 'true' },
              type: { type: 'string', example: 'boolean' },
              description: { type: 'string', example: 'Enable file uploads' },
            },
          },
          comments_enabled: {
            type: 'object',
            properties: {
              value: { type: 'string', example: 'true' },
              type: { type: 'string', example: 'boolean' },
              description: {
                type: 'string',
                example: 'Enable comments on posts',
              },
            },
          },
        },
      },
      AIResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Content generated successfully.',
          },
          data: {
            type: 'object',
            properties: {
              result: { type: 'string', example: 'Generated content...' },
              type: { type: 'string', example: 'BLOG' },
            },
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'Password123!',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            maxLength: 128,
            example: 'Password123!',
          },
        },
      },
    },
  },
};

const paths = {};

const addPath = (method, path, spec) => {
  if (!paths[path]) paths[path] = {};
  paths[path][method] = spec;
};

// ─── System ─────────────────────────────────────────────────────────────────
addPath('get', '/health', {
  tags: ['System'],
  summary: 'Health check',
  description: 'Returns the current health status of the API server.',
  responses: {
    200: {
      description: 'Server is healthy',
      content: {
        'application/json': {
          example: {
            status: 'ok',
            uptime: 12345,
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
      },
    },
  },
});

addPath('get', '/ready', {
  tags: ['System'],
  summary: 'Readiness check',
  description:
    'Checks if the server is ready to accept traffic by verifying database, storage, and AI service connectivity.',
  responses: {
    200: { description: 'Server is ready' },
    503: { description: 'Server is not ready (e.g., database down)' },
  },
});

addPath('get', '/metrics', {
  tags: ['System'],
  summary: 'Prometheus metrics',
  description: 'Exposes Prometheus-formatted metrics for monitoring.',
  responses: {
    200: { description: 'Metrics text output' },
  },
});

addPath('get', '/', {
  tags: ['System'],
  summary: 'Root endpoint',
  description: 'Returns a simple welcome message.',
  responses: {
    200: {
      description: 'Welcome message',
      content: {
        'application/json': {
          example: { success: true, message: 'PixelThread API is running!' },
        },
      },
    },
  },
});

// ─── Authentication ─────────────────────────────────────────────────────────
addPath('post', '/api/auth/register', {
  tags: ['Authentication'],
  summary: 'Register a new user',
  description:
    'Creates a new user account. Sends email verification if email service is configured.',
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/RegisterRequest' },
      },
    },
  },
  responses: {
    201: { description: 'User registered successfully. Sets auth cookies.' },
    400: {
      description: 'Validation error (missing fields, weak password, etc.)',
    },
    409: { description: 'Email already in use' },
    429: { description: 'Too many registration attempts' },
  },
});

addPath('post', '/api/auth/login', {
  tags: ['Authentication'],
  summary: 'Login',
  description:
    'Authenticates a user with email and password. Sets accessToken and refreshToken cookies.',
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/LoginRequest' },
      },
    },
  },
  responses: {
    200: { description: 'Login successful. Auth cookies set.' },
    401: { description: 'Invalid email or password' },
    429: { description: 'Too many login attempts' },
  },
});

addPath('post', '/api/auth/refresh', {
  tags: ['Authentication'],
  summary: 'Refresh access token',
  description:
    'Uses the refreshToken cookie to issue a new access token. Useful when auto-refresh fails.',
  responses: {
    200: { description: 'Token refreshed successfully.' },
    401: { description: 'Invalid or expired refresh token' },
  },
});

addPath('post', '/api/auth/logout', {
  tags: ['Authentication'],
  summary: 'Logout',
  description: 'Invalidates the current session and clears auth cookies.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: { description: 'Logged out successfully.' },
    401: { description: 'Not authenticated' },
  },
});

addPath('get', '/api/auth/me', {
  tags: ['Authentication'],
  summary: 'Get current user',
  description: "Returns the authenticated user's profile data.",
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Current user data',
      content: {
        'application/json': { schema: { $ref: '#/components/schemas/User' } },
      },
    },
    401: { description: 'Not authenticated' },
  },
});

addPath('post', '/api/auth/forgot-password', {
  tags: ['Authentication'],
  summary: 'Forgot password',
  description:
    "Sends a password reset link to the user's email if the account exists (silent on failure to prevent email enumeration).",
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        },
      },
    },
  },
  responses: {
    200: { description: 'Password reset email sent (if account exists).' },
    429: { description: 'Too many requests' },
  },
});

addPath('post', '/api/auth/reset-password', {
  tags: ['Authentication'],
  summary: 'Reset password',
  description:
    'Resets the password using a valid reset token received via email.',
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string' },
            password: { type: 'string', minLength: 8, maxLength: 128 },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Password reset successfully.' },
    400: { description: 'Invalid token or weak password' },
  },
});

addPath('post', '/api/auth/verify-email', {
  tags: ['Authentication'],
  summary: 'Verify email',
  description:
    "Verifies a user's email address using the token sent during registration.",
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['token'],
          properties: { token: { type: 'string' } },
        },
      },
    },
  },
  responses: {
    200: { description: 'Email verified successfully.' },
    400: { description: 'Invalid or expired verification token' },
  },
});

addPath('post', '/api/auth/resend-verification', {
  tags: ['Authentication'],
  summary: 'Resend verification email',
  description:
    "Resends the email verification link to the user's email address.",
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        },
      },
    },
  },
  responses: {
    200: { description: 'Verification email resent (if account exists).' },
    429: { description: 'Too many requests' },
  },
});

// ─── Users ──────────────────────────────────────────────────────────────────
addPath('get', '/api/users/{id}/posts', {
  tags: ['Users'],
  summary: 'Get user posts',
  description: 'Returns paginated published posts by a specific user.',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Paginated user posts' },
    404: { description: 'User not found' },
  },
});

addPath('get', '/api/users/{userId}/followers', {
  tags: ['Follows'],
  summary: 'Get followers',
  description:
    'Returns a paginated list of users following the specified user.',
  parameters: [
    { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Paginated followers list' },
    404: { description: 'User not found' },
  },
});

addPath('get', '/api/users/{userId}/following', {
  tags: ['Follows'],
  summary: 'Get following',
  description:
    'Returns a paginated list of users that the specified user follows.',
  parameters: [
    { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Paginated following list' },
    404: { description: 'User not found' },
  },
});

addPath('post', '/api/users/{userId}/follow', {
  tags: ['Follows'],
  summary: 'Follow a user',
  description: 'Follows the specified user. Requires authentication.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Successfully followed user' },
    400: { description: 'Cannot follow yourself' },
    401: { description: 'Not authenticated' },
    404: { description: 'User not found' },
  },
});

addPath('delete', '/api/users/{userId}/follow', {
  tags: ['Follows'],
  summary: 'Unfollow a user',
  description: 'Unfollows the specified user. Requires authentication.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Successfully unfollowed user' },
    401: { description: 'Not authenticated' },
    404: { description: 'User not found' },
  },
});

// ─── Posts ──────────────────────────────────────────────────────────────────
addPath('get', '/api/posts', {
  tags: ['Posts'],
  summary: 'Get all published posts',
  description: 'Returns a paginated list of published public posts.',
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Paginated list of posts' },
  },
});

addPath('get', '/api/posts/search', {
  tags: ['Posts', 'Search'],
  summary: 'Search posts',
  description:
    'Searches published public posts by title, content, excerpt, tags, and author.',
  parameters: [
    {
      name: 'q',
      in: 'query',
      schema: { type: 'string' },
      description: 'Search query',
    },
    {
      name: 'tag',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by exact tag name',
    },
    {
      name: 'authorId',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by author ID',
    },
    {
      name: 'sort',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['newest', 'oldest', 'mostViewed', 'mostLiked', 'relevance'],
        default: 'newest',
      },
    },
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Paginated search results' },
  },
});

addPath('get', '/api/posts/{slug}', {
  tags: ['Posts'],
  summary: 'Get post by slug',
  description: 'Returns a single post by its URL slug.',
  parameters: [
    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post details' },
    404: { description: 'Post not found' },
  },
});

addPath('post', '/api/posts', {
  tags: ['Posts'],
  summary: 'Create a post',
  description:
    'Creates a new blog post. Requires authentication and email verification.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          allOf: [
            { $ref: '#/components/schemas/PostCreate' },
            {
              type: 'object',
              properties: {
                files: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'Optional images (max 10 files)',
                },
              },
            },
          ],
        },
      },
    },
  },
  responses: {
    201: { description: 'Post created successfully' },
    400: { description: 'Validation error' },
    401: { description: 'Not authenticated' },
    403: { description: 'Email not verified' },
  },
});

addPath('put', '/api/posts/{id}', {
  tags: ['Posts'],
  summary: 'Update a post',
  description:
    'Updates an existing post. Only the author or an admin can update.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    content: {
      'multipart/form-data': {
        schema: {
          allOf: [
            { $ref: '#/components/schemas/PostUpdate' },
            {
              type: 'object',
              properties: {
                files: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                },
              },
            },
          ],
        },
      },
    },
  },
  responses: {
    200: { description: 'Post updated successfully' },
    403: { description: 'Not authorized to update this post' },
    404: { description: 'Post not found' },
  },
});

addPath('delete', '/api/posts/{id}', {
  tags: ['Posts'],
  summary: 'Delete a post',
  description: 'Deletes a post. Only the author or an admin can delete.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post deleted successfully' },
    403: { description: 'Not authorized' },
    404: { description: 'Post not found' },
  },
});

// ─── SEO ────────────────────────────────────────────────────────────────────
addPath('get', '/api/posts/{id}/seo', {
  tags: ['SEO'],
  summary: 'Get post SEO metadata',
  description: 'Returns SEO metadata for a specific post.',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'SEO metadata' },
    404: { description: 'Post not found' },
  },
});

addPath('patch', '/api/posts/{id}/seo', {
  tags: ['SEO'],
  summary: 'Update post SEO metadata',
  description: 'Updates the SEO metadata for a post. Requires authentication.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            metaTitle: { type: 'string', maxLength: 60 },
            metaDescription: { type: 'string', maxLength: 160 },
            keywords: { type: 'array', items: { type: 'string' } },
            canonicalUrl: { type: 'string', format: 'uri' },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'SEO metadata updated' },
    401: { description: 'Not authenticated' },
    404: { description: 'Post not found' },
  },
});

// ─── Analytics ──────────────────────────────────────────────────────────────
addPath('post', '/api/posts/{id}/view', {
  tags: ['Analytics'],
  summary: 'Record a post view',
  description:
    'Increments the view counter for a post. Public endpoint (no auth required).',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'View recorded' },
    404: { description: 'Post not found' },
  },
});

addPath('get', '/api/posts/{id}/analytics', {
  tags: ['Analytics'],
  summary: 'Get post analytics',
  description: 'Returns view count, like count, and comment count for a post.',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: {
      description: 'Post analytics data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Analytics' },
        },
      },
    },
    404: { description: 'Post not found' },
  },
});

addPath('get', '/api/me/analytics', {
  tags: ['Analytics'],
  summary: 'Get my overall analytics',
  description:
    'Returns aggregated analytics for the authenticated user across all their posts.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'User analytics',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UserAnalytics' },
        },
      },
    },
    401: { description: 'Not authenticated' },
  },
});

addPath('get', '/api/me/posts/analytics', {
  tags: ['Analytics'],
  summary: 'Get my post-level analytics',
  description:
    'Returns paginated per-post analytics for the authenticated user.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
    {
      name: 'sort',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['newest', 'oldest', 'mostViewed', 'mostLiked'],
        default: 'newest',
      },
    },
  ],
  responses: {
    200: { description: 'Paginated post analytics' },
    401: { description: 'Not authenticated' },
  },
});

addPath('get', '/api/me/posts/top', {
  tags: ['Analytics'],
  summary: 'Get my top posts',
  description:
    'Returns the top-performing posts for the authenticated user by views or likes.',
  security: [{ cookieAuth: [] }],
  parameters: [
    {
      name: 'sort',
      in: 'query',
      schema: { type: 'string', enum: ['views', 'likes'], default: 'views' },
    },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Top posts list' },
    401: { description: 'Not authenticated' },
  },
});

// ─── Comments ───────────────────────────────────────────────────────────────
addPath('get', '/api/posts/{postId}/comments', {
  tags: ['Comments'],
  summary: 'Get threaded comments',
  description: 'Returns a threaded tree of comments for a post.',
  parameters: [
    { name: 'postId', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: {
      description: 'Threaded comments array',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Comment' },
          },
        },
      },
    },
    404: { description: 'Post not found' },
  },
});

addPath('get', '/api/comments/{id}/replies', {
  tags: ['Comments'],
  summary: 'Get comment replies',
  description: 'Returns the full reply tree for a specific comment.',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Comment with nested replies' },
    404: { description: 'Comment not found' },
  },
});

addPath('post', '/api/posts/{postId}/comments', {
  tags: ['Comments'],
  summary: 'Create a comment',
  description:
    'Adds a comment to a post. Requires authentication and email verification.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'postId', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              minLength: 1,
              example: 'Great article!',
            },
          },
        },
      },
    },
  },
  responses: {
    201: { description: 'Comment created' },
    401: { description: 'Not authenticated' },
    403: { description: 'Email not verified' },
    404: { description: 'Post not found' },
  },
});

addPath('post', '/api/comments/{id}/replies', {
  tags: ['Comments'],
  summary: 'Reply to a comment',
  description:
    'Replies to an existing comment. Requires authentication and email verification.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string', minLength: 1 } },
        },
      },
    },
  },
  responses: {
    201: { description: 'Reply created' },
    401: { description: 'Not authenticated' },
    404: { description: 'Parent comment not found' },
  },
});

addPath('patch', '/api/comments/{id}', {
  tags: ['Comments'],
  summary: 'Update a comment',
  description: 'Updates a comment. Only the author or an admin can update.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string', minLength: 1 } },
        },
      },
    },
  },
  responses: {
    200: { description: 'Comment updated' },
    403: { description: 'Not authorized' },
    404: { description: 'Comment not found' },
  },
});

addPath('delete', '/api/comments/{id}', {
  tags: ['Comments'],
  summary: 'Delete a comment',
  description:
    'Deletes a comment and all its replies. Only the author or an admin can delete.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Comment deleted' },
    403: { description: 'Not authorized' },
    404: { description: 'Comment not found' },
  },
});

// ─── Likes ──────────────────────────────────────────────────────────────────
addPath('post', '/api/posts/{id}/like', {
  tags: ['Likes'],
  summary: 'Toggle post like',
  description: 'Likes or unlikes a post (toggle). Requires authentication.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Like toggled (liked or unliked)' },
    401: { description: 'Not authenticated' },
    404: { description: 'Post not found' },
  },
});

addPath('post', '/api/comments/{id}/like', {
  tags: ['Likes'],
  summary: 'Toggle comment like',
  description: 'Likes or unlikes a comment (toggle). Requires authentication.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Like toggled' },
    401: { description: 'Not authenticated' },
    404: { description: 'Comment not found' },
  },
});

addPath('get', '/api/posts/{id}/likes', {
  tags: ['Likes'],
  summary: 'Get post likes',
  description: 'Returns a list of users who liked a post.',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'List of users who liked the post' },
    404: { description: 'Post not found' },
  },
});

addPath('get', '/api/comments/{id}/likes', {
  tags: ['Likes'],
  summary: 'Get comment likes',
  description: 'Returns a list of users who liked a comment.',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'List of users who liked the comment' },
    404: { description: 'Comment not found' },
  },
});

addPath('get', '/api/posts/{id}/like-status', {
  tags: ['Likes'],
  summary: 'Get post like status',
  description: 'Checks if the authenticated user has liked a post.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Like status (isLiked boolean)' },
    401: { description: 'Not authenticated' },
  },
});

addPath('get', '/api/comments/{id}/like-status', {
  tags: ['Likes'],
  summary: 'Get comment like status',
  description: 'Checks if the authenticated user has liked a comment.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Like status' },
    401: { description: 'Not authenticated' },
  },
});

// ─── Tags ───────────────────────────────────────────────────────────────────
addPath('get', '/api/tags', {
  tags: ['Tags'],
  summary: 'Get all tags',
  description: 'Returns a list of all tags with post counts.',
  responses: {
    200: {
      description: 'List of tags',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Tag' },
          },
        },
      },
    },
  },
});

addPath('get', '/api/tags/{name}/posts', {
  tags: ['Tags'],
  summary: 'Get posts by tag',
  description: 'Returns paginated published posts for a specific tag.',
  parameters: [
    { name: 'name', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Paginated posts for tag' },
    404: { description: 'Tag not found' },
  },
});

addPath('post', '/api/tags', {
  tags: ['Tags'],
  summary: 'Create a tag',
  description: 'Creates a new tag. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['name'],
          properties: { name: { type: 'string', example: 'javascript' } },
        },
      },
    },
  },
  responses: {
    201: { description: 'Tag created' },
    403: { description: 'Admin access required' },
    409: { description: 'Tag already exists' },
  },
});

addPath('delete', '/api/tags/{id}', {
  tags: ['Tags'],
  summary: 'Delete a tag',
  description: 'Deletes a tag. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Tag deleted' },
    403: { description: 'Admin access required' },
    404: { description: 'Tag not found' },
  },
});

// ─── AI ─────────────────────────────────────────────────────────────────────
const aiEndpointBase = {
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'AI-generated content',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/AIResponse' },
        },
      },
    },
    400: { description: 'Invalid input or content too long' },
    401: { description: 'Not authenticated' },
    429: { description: 'Rate limit exceeded' },
  },
};

addPath('post', '/api/ai/generate-post', {
  tags: ['AI'],
  summary: 'Generate a full blog post',
  description:
    'Generates a complete blog post from a topic or keywords using AI.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['topic'],
          properties: {
            topic: {
              type: 'string',
              example: 'The future of artificial intelligence',
            },
            tone: {
              type: 'string',
              enum: ['professional', 'casual', 'academic'],
              default: 'professional',
            },
            length: {
              type: 'string',
              enum: ['short', 'medium', 'long'],
              default: 'medium',
            },
          },
        },
      },
    },
  },
});

addPath('post', '/api/ai/title', {
  tags: ['AI'],
  summary: 'Generate titles',
  description: 'Generates blog post title suggestions from content.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string', example: 'Article content here...' },
          },
        },
      },
    },
  },
});

addPath('post', '/api/ai/title/improve', {
  tags: ['AI'],
  summary: 'Improve a title',
  description: 'Improves an existing title to make it more engaging.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['title'],
          properties: { title: { type: 'string', example: 'My Article' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/excerpt', {
  tags: ['AI'],
  summary: 'Generate excerpt',
  description: 'Generates a short excerpt/summary from post content.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/tags', {
  tags: ['AI'],
  summary: 'Generate tags',
  description: 'Generates relevant tags from post content.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/seo', {
  tags: ['AI'],
  summary: 'Generate SEO metadata',
  description: 'Generates SEO title, description, and keywords from content.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/improve', {
  tags: ['AI'],
  summary: 'Improve writing',
  description: 'Improves the quality and readability of the provided text.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/rewrite', {
  tags: ['AI'],
  summary: 'Rewrite content',
  description:
    'Rewrites content in a different style while preserving meaning.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' }, tone: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/expand', {
  tags: ['AI'],
  summary: 'Expand content',
  description: 'Expands on existing content with more details and examples.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/shorten', {
  tags: ['AI'],
  summary: 'Shorten content',
  description:
    'Condenses content to a shorter version while keeping key points.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/continue', {
  tags: ['AI'],
  summary: 'Continue writing',
  description: 'Continues writing from where the content ends.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/summarize', {
  tags: ['AI'],
  summary: 'Summarize content',
  description: 'Produces a concise summary of the provided content.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/faq', {
  tags: ['AI'],
  summary: 'Generate FAQ',
  description: 'Generates FAQ-style questions and answers from content.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/social', {
  tags: ['AI'],
  summary: 'Generate social media posts',
  description: 'Generates social media promotional posts from content.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string' },
            platform: {
              type: 'string',
              enum: ['twitter', 'linkedin', 'facebook'],
              default: 'twitter',
            },
          },
        },
      },
    },
  },
});

addPath('post', '/api/ai/suggestions', {
  tags: ['AI'],
  summary: 'Generate writing suggestions',
  description:
    'Provides suggestions to improve the content structure and quality.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },
      },
    },
  },
});

addPath('post', '/api/ai/suggestions/apply', {
  tags: ['AI'],
  summary: 'Apply AI suggestions',
  description: 'Applies previously generated AI suggestions to the content.',
  ...aiEndpointBase,
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['content', 'suggestions'],
          properties: {
            content: { type: 'string' },
            suggestions: { type: 'object' },
          },
        },
      },
    },
  },
});

// ─── Notifications ──────────────────────────────────────────────────────────
addPath('get', '/api/notifications', {
  tags: ['Notifications'],
  summary: 'Get my notifications',
  description:
    'Returns a paginated list of notifications for the authenticated user.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 20, maximum: 100 },
    },
    {
      name: 'type',
      in: 'query',
      schema: {
        type: 'string',
        enum: [
          'LIKE',
          'COMMENT',
          'COMMENT_REPLY',
          'FOLLOW',
          'POST_PUBLISHED',
          'POST_FEATURED',
          'MENTION',
          'SYSTEM',
        ],
      },
    },
    { name: 'isRead', in: 'query', schema: { type: 'boolean' } },
  ],
  responses: {
    200: { description: 'Paginated notifications' },
    401: { description: 'Not authenticated' },
  },
});

addPath('get', '/api/notifications/unread-count', {
  tags: ['Notifications'],
  summary: 'Get unread notification count',
  description:
    'Returns the count of unread notifications for the authenticated user.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Unread count',
      content: {
        'application/json': { example: { success: true, data: { count: 5 } } },
      },
    },
  },
});

addPath('patch', '/api/notifications/read-all', {
  tags: ['Notifications'],
  summary: 'Mark all notifications as read',
  description:
    'Marks all unread notifications as read for the authenticated user.',
  security: [{ cookieAuth: [] }],
  responses: { 200: { description: 'All notifications marked as read' } },
});

addPath('patch', '/api/notifications/{id}/read', {
  tags: ['Notifications'],
  summary: 'Mark notification as read',
  description: 'Marks a single notification as read.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Notification marked as read' },
    404: { description: 'Notification not found' },
  },
});

addPath('delete', '/api/notifications/read', {
  tags: ['Notifications'],
  summary: 'Delete all read notifications',
  description: 'Deletes all read notifications for the authenticated user.',
  security: [{ cookieAuth: [] }],
  responses: { 200: { description: 'Read notifications deleted' } },
});

addPath('delete', '/api/notifications/{id}', {
  tags: ['Notifications'],
  summary: 'Delete a notification',
  description: 'Deletes a single notification. Only the recipient can delete.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Notification deleted' },
    404: { description: 'Notification not found' },
  },
});

addPath('post', '/api/notifications/broadcast', {
  tags: ['Notifications'],
  summary: 'Broadcast system notification',
  description:
    'Sends a system notification to all active users. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['title', 'message'],
          properties: {
            title: { type: 'string', example: 'System Update' },
            message: { type: 'string', example: 'New features available.' },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Broadcast sent' },
    403: { description: 'Admin access required' },
  },
});

// ─── Search ─────────────────────────────────────────────────────────────────
addPath('get', '/api/search', {
  tags: ['Search'],
  summary: 'Global search',
  description:
    'Searches across posts, users, and tags with a single query. Supports filtering by type and sorting by relevance.',
  parameters: [
    {
      name: 'q',
      in: 'query',
      required: true,
      schema: { type: 'string' },
      description: 'Search query',
    },
    {
      name: 'type',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['all', 'posts', 'users', 'tags'],
        default: 'all',
      },
    },
    {
      name: 'sort',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['newest', 'oldest', 'mostViewed', 'mostLiked', 'relevance'],
        default: 'newest',
      },
    },
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
    {
      name: 'tag',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter posts by tag name',
    },
    {
      name: 'author',
      in: 'query',
      schema: { type: 'string' },
      description: 'Filter by author name',
    },
    {
      name: 'dateFrom',
      in: 'query',
      schema: { type: 'string', format: 'date' },
    },
    { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: { 200: { description: 'Search results (posts, users, tags)' } },
});

addPath('get', '/api/search/suggestions', {
  tags: ['Search'],
  summary: 'Get search suggestions',
  description: 'Returns autocomplete suggestions for a partial query.',
  parameters: [
    { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
  ],
  responses: { 200: { description: 'Suggestions (posts, users, tags)' } },
});

addPath('get', '/api/search/trending', {
  tags: ['Search'],
  summary: 'Get trending searches',
  description: 'Returns the most popular search keywords.',
  responses: { 200: { description: 'Trending keywords' } },
});

addPath('get', '/api/search/history', {
  tags: ['Search'],
  summary: 'Get search history',
  description: "Returns the authenticated user's recent search history.",
  security: [{ cookieAuth: [] }],
  responses: {
    200: { description: 'Search history' },
    401: { description: 'Not authenticated' },
  },
});

addPath('delete', '/api/search/history', {
  tags: ['Search'],
  summary: 'Clear search history',
  description: "Clears the authenticated user's search history.",
  security: [{ cookieAuth: [] }],
  responses: { 200: { description: 'History cleared' } },
});

addPath('get', '/api/search/popular-tags', {
  tags: ['Search'],
  summary: 'Get popular tags',
  description: 'Returns the most used tags across the platform.',
  responses: {
    200: {
      description: 'Popular tags',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Tag' },
          },
        },
      },
    },
  },
});

addPath('get', '/api/search/authors', {
  tags: ['Search'],
  summary: 'Discover authors',
  description:
    'Returns a paginated list of popular authors with published posts.',
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: { 200: { description: 'Paginated author list' } },
});

// ─── Bookmarks ──────────────────────────────────────────────────────────────
addPath('get', '/api/me/bookmarks', {
  tags: ['Bookmarks'],
  summary: 'Get my bookmarks',
  description:
    "Returns a paginated list of the authenticated user's bookmarked posts.",
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Paginated bookmarks' },
    401: { description: 'Not authenticated' },
  },
});

addPath('post', '/api/posts/{id}/bookmark', {
  tags: ['Bookmarks'],
  summary: 'Bookmark a post',
  description: 'Bookmarks a post for the authenticated user.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post bookmarked' },
    401: { description: 'Not authenticated' },
    404: { description: 'Post not found' },
  },
});

addPath('delete', '/api/posts/{id}/bookmark', {
  tags: ['Bookmarks'],
  summary: 'Remove bookmark',
  description: 'Removes a bookmark from a post.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Bookmark removed' },
    401: { description: 'Not authenticated' },
  },
});

addPath('get', '/api/posts/{id}/bookmark/status', {
  tags: ['Bookmarks'],
  summary: 'Get bookmark status',
  description: 'Checks if the authenticated user has bookmarked a post.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Bookmark status' },
    401: { description: 'Not authenticated' },
  },
});

// ─── Reading History ────────────────────────────────────────────────────────
addPath('get', '/api/me/history', {
  tags: ['Reading History'],
  summary: 'Get reading history',
  description: "Returns the authenticated user's reading history.",
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Paginated reading history' },
    401: { description: 'Not authenticated' },
  },
});

addPath('delete', '/api/me/history', {
  tags: ['Reading History'],
  summary: 'Clear reading history',
  description: 'Clears all reading history for the authenticated user.',
  security: [{ cookieAuth: [] }],
  responses: { 200: { description: 'History cleared' } },
});

addPath('delete', '/api/me/history/{id}', {
  tags: ['Reading History'],
  summary: 'Delete history item',
  description: 'Deletes a single entry from the reading history.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'History item deleted' },
    404: { description: 'Entry not found' },
  },
});

// ─── Reports ────────────────────────────────────────────────────────────────
addPath('post', '/api/posts/{id}/report', {
  tags: ['Reports'],
  summary: 'Report a post',
  description: 'Reports a post for violating platform rules.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: {
              type: 'string',
              enum: [
                'SPAM',
                'HARASSMENT',
                'HATE_SPEECH',
                'MISINFORMATION',
                'COPYRIGHT',
                'ADULT_CONTENT',
                'VIOLENCE',
                'IMPERSONATION',
                'OTHER',
              ],
            },
            description: { type: 'string', maxLength: 1000 },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Report submitted' },
    400: { description: 'Cannot report own content' },
    409: { description: 'Duplicate report' },
  },
});

addPath('post', '/api/comments/{id}/report', {
  tags: ['Reports'],
  summary: 'Report a comment',
  description: 'Reports a comment for violating platform rules.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: {
              type: 'string',
              enum: [
                'SPAM',
                'HARASSMENT',
                'HATE_SPEECH',
                'MISINFORMATION',
                'COPYRIGHT',
                'ADULT_CONTENT',
                'VIOLENCE',
                'IMPERSONATION',
                'OTHER',
              ],
            },
            description: { type: 'string', maxLength: 1000 },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Report submitted' },
    409: { description: 'Duplicate report' },
  },
});

addPath('post', '/api/users/{id}/report', {
  tags: ['Reports'],
  summary: 'Report a user',
  description: 'Reports a user account for violating platform rules.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: {
              type: 'string',
              enum: [
                'SPAM',
                'HARASSMENT',
                'HATE_SPEECH',
                'MISINFORMATION',
                'COPYRIGHT',
                'ADULT_CONTENT',
                'VIOLENCE',
                'IMPERSONATION',
                'OTHER',
              ],
            },
            description: { type: 'string', maxLength: 1000 },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Report submitted' },
    400: { description: 'Cannot report yourself' },
    409: { description: 'Duplicate report' },
  },
});

addPath('get', '/api/admin/reports', {
  tags: ['Reports'],
  summary: 'List reports (Admin)',
  description: 'Returns a paginated list of all reports. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
    {
      name: 'status',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
      },
    },
    {
      name: 'reportType',
      in: 'query',
      schema: { type: 'string', enum: ['POST', 'COMMENT', 'USER'] },
    },
    { name: 'reportReason', in: 'query', schema: { type: 'string' } },
    {
      name: 'sort',
      in: 'query',
      schema: { type: 'string', enum: ['newest', 'oldest'], default: 'newest' },
    },
  ],
  responses: {
    200: { description: 'Paginated reports' },
    403: { description: 'Admin access required' },
  },
});

addPath('get', '/api/admin/reports/analytics', {
  tags: ['Reports'],
  summary: 'Get report analytics (Admin)',
  description:
    'Returns report statistics by status and time windows. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: { description: 'Report analytics' },
    403: { description: 'Admin access required' },
  },
});

addPath('get', '/api/admin/reports/{id}', {
  tags: ['Reports'],
  summary: 'Get report by ID (Admin)',
  description:
    'Returns detailed information about a specific report. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Report details' },
    403: { description: 'Admin access required' },
    404: { description: 'Report not found' },
  },
});

addPath('patch', '/api/admin/reports/{id}/status', {
  tags: ['Reports'],
  summary: 'Change report status (Admin)',
  description:
    'Updates the status of a report (e.g., to UNDER_REVIEW). Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['PENDING', 'UNDER_REVIEW'] },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Status updated' },
    403: { description: 'Admin access required' },
    404: { description: 'Report not found' },
  },
});

addPath('patch', '/api/admin/reports/{id}/resolve', {
  tags: ['Reports'],
  summary: 'Resolve a report (Admin)',
  description:
    'Resolves a report with an optional action. Notifies the reporter. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: [
                'NO_ACTION',
                'DELETE_POST',
                'DELETE_COMMENT',
                'WARN_USER',
                'SUSPEND_USER',
                'BAN_USER',
              ],
            },
            resolutionNote: { type: 'string', maxLength: 2000 },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Report resolved' },
    403: { description: 'Admin access required' },
    404: { description: 'Report not found' },
  },
});

addPath('patch', '/api/admin/reports/{id}/reject', {
  tags: ['Reports'],
  summary: 'Reject a report (Admin)',
  description:
    'Rejects a report with a reason. Notifies the reporter. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: { type: 'string', example: 'No violation found.' },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Report rejected' },
    403: { description: 'Admin access required' },
    404: { description: 'Report not found' },
  },
});

// ─── Settings / Profile ─────────────────────────────────────────────────────
addPath('get', '/api/me/settings', {
  tags: ['Settings'],
  summary: 'Get my settings',
  description:
    'Returns all settings for the authenticated user (profile, privacy, notifications, preferences).',
  security: [{ cookieAuth: [] }],
  responses: {
    200: { description: 'User settings' },
    401: { description: 'Not authenticated' },
  },
});

addPath('patch', '/api/me/profile', {
  tags: ['Profiles'],
  summary: 'Update profile',
  description: "Updates the authenticated user's public profile information.",
  security: [{ cookieAuth: [] }],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50 },
            username: { type: 'string' },
            bio: { type: 'string', maxLength: 500 },
            location: { type: 'string', maxLength: 100 },
            website: { type: 'string', format: 'uri' },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Profile updated' },
    401: { description: 'Not authenticated' },
  },
});

addPath('patch', '/api/me/email', {
  tags: ['Settings'],
  summary: 'Change email',
  description:
    'Initiates an email change. A verification link is sent to the new email address.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Verification email sent' },
    401: { description: 'Invalid password' },
  },
});

addPath('get', '/api/me/email/verify', {
  tags: ['Settings'],
  summary: 'Verify new email',
  description:
    'Verifies the new email address using a token sent during the email change process.',
  parameters: [
    { name: 'token', in: 'query', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Email verified' },
    400: { description: 'Invalid or expired token' },
  },
});

addPath('patch', '/api/me/password', {
  tags: ['Settings'],
  summary: 'Change password',
  description: "Changes the authenticated user's password.",
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', format: 'password' },
            newPassword: {
              type: 'string',
              format: 'password',
              minLength: 8,
              maxLength: 128,
            },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Password changed' },
    400: { description: 'Weak new password' },
    401: { description: 'Current password is incorrect' },
  },
});

addPath('patch', '/api/me/privacy', {
  tags: ['Settings'],
  summary: 'Update privacy settings',
  description: 'Updates privacy-related settings for the authenticated user.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            profileVisibility: {
              type: 'string',
              enum: ['PUBLIC', 'PRIVATE', 'FOLLOWERS_ONLY'],
            },
            emailVisibility: { type: 'boolean' },
          },
        },
      },
    },
  },
  responses: { 200: { description: 'Privacy settings updated' } },
});

addPath('patch', '/api/me/notifications', {
  tags: ['Settings'],
  summary: 'Update notification preferences',
  description: 'Updates notification preferences for the authenticated user.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: { notificationPreferences: { type: 'object' } },
        },
      },
    },
  },
  responses: { 200: { description: 'Notification preferences updated' } },
});

addPath('patch', '/api/me/preferences', {
  tags: ['Settings'],
  summary: 'Update preferences',
  description:
    'Updates general preferences (language, timezone, theme) for the authenticated user.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            language: { type: 'string', default: 'en' },
            timezone: { type: 'string' },
            themePreference: {
              type: 'string',
              enum: ['light', 'dark', 'system'],
            },
          },
        },
      },
    },
  },
  responses: { 200: { description: 'Preferences updated' } },
});

// ─── Media (Settings-based avatar/cover uploads) ─────────────────────────────
addPath('post', '/api/me/avatar', {
  tags: ['Profiles'],
  summary: 'Upload avatar',
  description:
    'Uploads a profile avatar image. Supported formats: JPEG, PNG, WebP, GIF. Max size: 10MB.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            avatar: {
              type: 'string',
              format: 'binary',
              description: 'Image file (jpeg, png, webp, gif). Max 10MB.',
            },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Avatar uploaded' },
    400: { description: 'Invalid file type or size' },
  },
});

addPath('post', '/api/me/cover', {
  tags: ['Profiles'],
  summary: 'Upload cover image',
  description:
    'Uploads a profile cover image. Supported formats: JPEG, PNG, WebP, GIF. Max size: 10MB.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            cover: {
              type: 'string',
              format: 'binary',
              description: 'Image file (jpeg, png, webp, gif). Max 10MB.',
            },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Cover image uploaded' },
    400: { description: 'Invalid file type or size' },
  },
});

addPath('delete', '/api/me/avatar', {
  tags: ['Profiles'],
  summary: 'Delete avatar',
  description: "Removes the authenticated user's avatar.",
  security: [{ cookieAuth: [] }],
  responses: { 200: { description: 'Avatar deleted' } },
});

addPath('delete', '/api/me/cover', {
  tags: ['Profiles'],
  summary: 'Delete cover image',
  description: "Removes the authenticated user's cover image.",
  security: [{ cookieAuth: [] }],
  responses: { 200: { description: 'Cover image deleted' } },
});

addPath('delete', '/api/me', {
  tags: ['Settings'],
  summary: 'Delete account',
  description: "Soft-deletes the authenticated user's account.",
  security: [{ cookieAuth: [] }],
  responses: { 200: { description: 'Account deleted' } },
});

// ─── Media (General) ────────────────────────────────────────────────────────
addPath('get', '/api/me/media', {
  tags: ['Media'],
  summary: 'Get my media',
  description:
    "Returns a paginated list of the authenticated user's uploaded media files.",
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 20, maximum: 100 },
    },
    {
      name: 'sort',
      in: 'query',
      schema: { type: 'string', enum: ['newest', 'oldest'], default: 'newest' },
    },
  ],
  responses: {
    200: { description: 'Paginated media list' },
    401: { description: 'Not authenticated' },
  },
});

addPath('post', '/api/media', {
  tags: ['Media'],
  summary: 'Upload media',
  description:
    'Uploads a media file. Supported formats: JPEG, PNG, WebP, GIF. Max size: 10MB. Automatically generates WebP and thumbnail variants.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          required: ['file'],
          properties: {
            file: {
              type: 'string',
              format: 'binary',
              description: 'Image file (jpeg, png, webp, gif). Max 10MB.',
            },
            altText: { type: 'string', maxLength: 500 },
          },
        },
      },
    },
  },
  responses: {
    201: { description: 'Media uploaded' },
    400: { description: 'Invalid file type or size' },
    413: { description: 'File too large' },
  },
});

addPath('patch', '/api/media/{id}', {
  tags: ['Media'],
  summary: 'Replace media',
  description:
    'Replaces an existing media file with a new one. Only the owner can replace.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            file: { type: 'string', format: 'binary' },
            altText: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Media replaced' },
    403: { description: 'Not authorized' },
    404: { description: 'Media not found' },
  },
});

addPath('delete', '/api/media/{id}', {
  tags: ['Media'],
  summary: 'Delete media',
  description: 'Deletes a media file. Only the owner can delete.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Media deleted' },
    403: { description: 'Not authorized' },
    404: { description: 'Media not found' },
  },
});

// ─── Admin: Existing /api/admin/analytics ───────────────────────────────────
addPath('get', '/api/admin/analytics', {
  tags: ['Admin'],
  summary: 'Get enhanced admin analytics',
  description:
    'Returns comprehensive analytics including growth, DAU/MAU, top authors/tags, AI usage, storage stats, and top posts. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: { description: 'Enhanced analytics data' },
    403: { description: 'Admin access required' },
  },
});

// ─── Admin: Dashboard ───────────────────────────────────────────────────────
addPath('get', '/api/admin/dashboard', {
  tags: ['Admin'],
  summary: 'Get admin dashboard',
  description:
    'Returns aggregate dashboard data including user counts, post counts, engagement metrics, and report statistics. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Dashboard data',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/AdminDashboard' },
        },
      },
    },
    403: { description: 'Admin access required' },
  },
});

// ─── Admin: User Management ─────────────────────────────────────────────────
addPath('get', '/api/admin/users', {
  tags: ['Admin'],
  summary: 'List users (Admin)',
  description:
    'Returns a paginated list of all users with optional filters. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
    {
      name: 'search',
      in: 'query',
      schema: { type: 'string' },
      description: 'Search by name, email, or username',
    },
    {
      name: 'role',
      in: 'query',
      schema: { type: 'string', enum: ['USER', 'ADMIN'] },
    },
    {
      name: 'verified',
      in: 'query',
      schema: { type: 'string', enum: ['true', 'false'] },
    },
    {
      name: 'banned',
      in: 'query',
      schema: { type: 'string', enum: ['true', 'false'] },
    },
    {
      name: 'active',
      in: 'query',
      schema: { type: 'string', enum: ['true', 'false'] },
    },
  ],
  responses: {
    200: { description: 'Paginated user list' },
    403: { description: 'Admin access required' },
  },
});

addPath('get', '/api/admin/users/{id}', {
  tags: ['Admin'],
  summary: 'Get user details (Admin)',
  description:
    'Returns detailed user information including statistics, reports, and account status. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'User details' },
    403: { description: 'Admin access required' },
    404: { description: 'User not found' },
  },
});

addPath('patch', '/api/admin/users/{id}/role', {
  tags: ['Admin'],
  summary: 'Update user role (Admin)',
  description:
    "Changes a user's role (USER ↔ ADMIN). Admins cannot change their own role. Requires ADMIN role. Audited.",
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['role'],
          properties: { role: { type: 'string', enum: ['USER', 'ADMIN'] } },
        },
      },
    },
  },
  responses: {
    200: { description: 'Role updated' },
    403: { description: 'Cannot change own role or admin access required' },
    404: { description: 'User not found' },
  },
});

addPath('patch', '/api/admin/users/{id}/ban', {
  tags: ['Admin'],
  summary: 'Ban a user (Admin)',
  description:
    'Bans a user account. Revokes all sessions, disables login, and notifies the user. Admins cannot ban themselves. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: { type: 'string', maxLength: 500, example: 'Spam' },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'User banned' },
    400: { description: 'User already banned' },
    403: { description: 'Cannot ban self' },
    404: { description: 'User not found' },
  },
});

addPath('patch', '/api/admin/users/{id}/unban', {
  tags: ['Admin'],
  summary: 'Unban a user (Admin)',
  description:
    'Restores a banned user account. Admins cannot unban themselves. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'User unbanned' },
    400: { description: 'User not banned' },
    403: { description: 'Cannot unban self' },
    404: { description: 'User not found' },
  },
});

addPath('patch', '/api/admin/users/{id}/verify', {
  tags: ['Admin'],
  summary: 'Verify a user (Admin)',
  description:
    "Manually verifies a user's email address. Requires ADMIN role. Audited.",
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'User verified' },
    400: { description: 'User already verified' },
    404: { description: 'User not found' },
  },
});

// ─── Admin: Post Management ─────────────────────────────────────────────────
addPath('get', '/api/admin/posts', {
  tags: ['Admin'],
  summary: 'List all posts (Admin)',
  description:
    'Returns a paginated list of ALL posts (including drafts, archived, private). Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
    {
      name: 'status',
      in: 'query',
      schema: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
    },
    {
      name: 'visibility',
      in: 'query',
      schema: { type: 'string', enum: ['PUBLIC', 'PRIVATE'] },
    },
    { name: 'authorId', in: 'query', schema: { type: 'string' } },
    { name: 'tag', in: 'query', schema: { type: 'string' } },
    { name: 'search', in: 'query', schema: { type: 'string' } },
    {
      name: 'sort',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['newest', 'oldest', 'mostViewed', 'mostLiked', 'mostCommented'],
        default: 'newest',
      },
    },
    {
      name: 'featured',
      in: 'query',
      schema: { type: 'string', enum: ['true', 'false'] },
    },
    {
      name: 'pinned',
      in: 'query',
      schema: { type: 'string', enum: ['true', 'false'] },
    },
  ],
  responses: {
    200: { description: 'Paginated post list' },
    403: { description: 'Admin access required' },
  },
});

addPath('delete', '/api/admin/posts/{id}', {
  tags: ['Admin'],
  summary: 'Delete any post (Admin)',
  description:
    'Permanently deletes any post regardless of author. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post deleted' },
    403: { description: 'Admin access required' },
    404: { description: 'Post not found' },
  },
});

addPath('patch', '/api/admin/posts/{id}/archive', {
  tags: ['Admin'],
  summary: 'Archive a post (Admin)',
  description:
    "Sets a post's status to ARCHIVED. Requires ADMIN role. Audited.",
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post archived' },
    400: { description: 'Post already archived' },
    403: { description: 'Admin access required' },
    404: { description: 'Post not found' },
  },
});

addPath('patch', '/api/admin/posts/{id}/restore', {
  tags: ['Admin'],
  summary: 'Restore a post (Admin)',
  description:
    'Restores an archived post back to DRAFT status. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post restored' },
    400: { description: 'Post is not archived' },
    403: { description: 'Admin access required' },
    404: { description: 'Post not found' },
  },
});

addPath('patch', '/api/admin/posts/{id}/feature', {
  tags: ['Admin'],
  summary: 'Feature a post (Admin)',
  description:
    'Marks a post as featured. Notifies the post author. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post featured' },
    400: { description: 'Post already featured' },
    403: { description: 'Admin access required' },
    404: { description: 'Post not found' },
  },
});

addPath('patch', '/api/admin/posts/{id}/unfeature', {
  tags: ['Admin'],
  summary: 'Unfeature a post (Admin)',
  description:
    'Removes featured status from a post. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post unfeatured' },
    400: { description: 'Post is not featured' },
    403: { description: 'Admin access required' },
    404: { description: 'Post not found' },
  },
});

addPath('patch', '/api/admin/posts/{id}/pin', {
  tags: ['Admin'],
  summary: 'Pin a post (Admin)',
  description:
    'Pins a post so it appears at the top of listings. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post pinned' },
    400: { description: 'Post already pinned' },
    403: { description: 'Admin access required' },
    404: { description: 'Post not found' },
  },
});

addPath('patch', '/api/admin/posts/{id}/unpin', {
  tags: ['Admin'],
  summary: 'Unpin a post (Admin)',
  description:
    'Removes pinned status from a post. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Post unpinned' },
    400: { description: 'Post not pinned' },
    403: { description: 'Admin access required' },
    404: { description: 'Post not found' },
  },
});

// ─── Admin: Comment Moderation ──────────────────────────────────────────────
addPath('get', '/api/admin/comments', {
  tags: ['Admin'],
  summary: 'List all comments (Admin)',
  description:
    'Returns a paginated list of ALL comments with optional filters. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
    { name: 'postId', in: 'query', schema: { type: 'string' } },
    { name: 'userId', in: 'query', schema: { type: 'string' } },
    {
      name: 'hidden',
      in: 'query',
      schema: { type: 'string', enum: ['true', 'false'] },
    },
    { name: 'search', in: 'query', schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Paginated comment list' },
    403: { description: 'Admin access required' },
  },
});

addPath('delete', '/api/admin/comments/{id}', {
  tags: ['Admin'],
  summary: 'Delete any comment (Admin)',
  description:
    'Permanently deletes any comment regardless of author. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Comment deleted' },
    403: { description: 'Admin access required' },
    404: { description: 'Comment not found' },
  },
});

addPath('patch', '/api/admin/comments/{id}/hide', {
  tags: ['Admin'],
  summary: 'Hide a comment (Admin)',
  description:
    'Hides a comment from public view. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Comment hidden' },
    400: { description: 'Comment already hidden' },
    403: { description: 'Admin access required' },
    404: { description: 'Comment not found' },
  },
});

addPath('patch', '/api/admin/comments/{id}/approve', {
  tags: ['Admin'],
  summary: 'Approve a comment (Admin)',
  description:
    'Unhides a previously hidden comment. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Comment approved' },
    400: { description: 'Comment is not hidden' },
    403: { description: 'Admin access required' },
    404: { description: 'Comment not found' },
  },
});

// ─── Admin: Media Management ────────────────────────────────────────────────
addPath('get', '/api/admin/media', {
  tags: ['Admin'],
  summary: 'List all media (Admin)',
  description:
    'Returns a paginated list of ALL uploaded media with filters. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
    { name: 'ownerId', in: 'query', schema: { type: 'string' } },
    { name: 'mimeType', in: 'query', schema: { type: 'string' } },
    { name: 'search', in: 'query', schema: { type: 'string' } },
    {
      name: 'dateFrom',
      in: 'query',
      schema: { type: 'string', format: 'date' },
    },
    { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: {
    200: { description: 'Paginated media list' },
    403: { description: 'Admin access required' },
  },
});

addPath('delete', '/api/admin/media/{id}', {
  tags: ['Admin'],
  summary: 'Delete any media (Admin)',
  description:
    'Deletes any media file regardless of owner. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Media deleted' },
    403: { description: 'Admin access required' },
    404: { description: 'Media not found' },
  },
});

addPath('get', '/api/admin/media/orphaned', {
  tags: ['Admin'],
  summary: 'Get orphaned media (Admin)',
  description: 'Lists all media files without references. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: { description: 'Orphaned media list' },
    403: { description: 'Admin access required' },
  },
});

addPath('delete', '/api/admin/media/orphaned', {
  tags: ['Admin'],
  summary: 'Delete orphaned media (Admin)',
  description:
    'Deletes orphaned media files in batches. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: { description: 'Orphaned media deleted' },
    403: { description: 'Admin access required' },
  },
});

// ─── Admin: Announcements ───────────────────────────────────────────────────
addPath('post', '/api/admin/announcements', {
  tags: ['Admin'],
  summary: 'Create announcement (Admin)',
  description:
    'Creates a platform announcement. Sends system notifications to all active users. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['title', 'message'],
          properties: {
            title: {
              type: 'string',
              maxLength: 200,
              example: 'Scheduled Maintenance',
            },
            message: {
              type: 'string',
              maxLength: 5000,
              example: 'Platform will be down for 2 hours.',
            },
            type: {
              type: 'string',
              enum: ['INFO', 'WARNING', 'ALERT', 'MAINTENANCE'],
              default: 'INFO',
            },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  responses: {
    201: { description: 'Announcement created' },
    403: { description: 'Admin access required' },
  },
});

addPath('get', '/api/admin/announcements', {
  tags: ['Admin'],
  summary: 'List announcements (Admin)',
  description:
    'Returns a paginated list of all platform announcements. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
  ],
  responses: {
    200: { description: 'Paginated announcements' },
    403: { description: 'Admin access required' },
  },
});

addPath('delete', '/api/admin/announcements/{id}', {
  tags: ['Admin'],
  summary: 'Delete announcement (Admin)',
  description: 'Deletes a platform announcement. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Announcement deleted' },
    403: { description: 'Admin access required' },
    404: { description: 'Announcement not found' },
  },
});

// ─── Admin: Audit Logs ──────────────────────────────────────────────────────
addPath('get', '/api/admin/audit-logs', {
  tags: ['Admin'],
  summary: 'List audit logs (Admin)',
  description:
    'Returns a paginated list of all admin actions. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    {
      name: 'limit',
      in: 'query',
      schema: { type: 'integer', default: 10, maximum: 100 },
    },
    { name: 'action', in: 'query', schema: { type: 'string' } },
    { name: 'targetType', in: 'query', schema: { type: 'string' } },
    { name: 'adminId', in: 'query', schema: { type: 'string' } },
    { name: 'targetId', in: 'query', schema: { type: 'string' } },
  ],
  responses: {
    200: { description: 'Paginated audit logs' },
    403: { description: 'Admin access required' },
  },
});

addPath('get', '/api/admin/audit-logs/stats', {
  tags: ['Admin'],
  summary: 'Get audit log statistics (Admin)',
  description:
    'Returns audit log analytics including total count, top actions, and recent activity. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: { description: 'Audit log stats' },
    403: { description: 'Admin access required' },
  },
});

// ─── Admin: Search ──────────────────────────────────────────────────────────
addPath('get', '/api/admin/search', {
  tags: ['Admin'],
  summary: 'Admin search (Admin)',
  description:
    'Searches across users, posts, reports, and media from a single endpoint. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  parameters: [
    { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
    {
      name: 'type',
      in: 'query',
      schema: {
        type: 'string',
        enum: ['all', 'users', 'posts', 'reports', 'media'],
        default: 'all',
      },
    },
  ],
  responses: {
    200: { description: 'Search results from all scopes' },
    403: { description: 'Admin access required' },
  },
});

// ─── Admin: Platform Settings ───────────────────────────────────────────────
addPath('get', '/api/admin/settings', {
  tags: ['Admin'],
  summary: 'Get platform settings (Admin)',
  description: 'Returns all platform-wide settings. Requires ADMIN role.',
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: 'Platform settings',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/PlatformSettings' },
        },
      },
    },
    403: { description: 'Admin access required' },
  },
});

addPath('patch', '/api/admin/settings', {
  tags: ['Admin'],
  summary: 'Update platform settings (Admin)',
  description: 'Updates platform-wide settings. Requires ADMIN role. Audited.',
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            maintenance_mode: { type: 'string', enum: ['true', 'false'] },
            registration_enabled: { type: 'string', enum: ['true', 'false'] },
            ai_enabled: { type: 'string', enum: ['true', 'false'] },
            uploads_enabled: { type: 'string', enum: ['true', 'false'] },
            comments_enabled: { type: 'string', enum: ['true', 'false'] },
          },
        },
      },
    },
  },
  responses: {
    200: { description: 'Settings updated' },
    403: { description: 'Admin access required' },
  },
});

// ─── Media ──────────────────────────────────────────────────────────────────

openapi.paths = paths;

module.exports = openapi;
