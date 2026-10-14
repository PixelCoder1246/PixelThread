# PixelThread Frontend Audit

## A. Current Frontend Structure

```
client/src/
├── app/
│   ├── layout.tsx                    # Root layout (public)
│   ├── page.tsx                      # Landing page (public)
│   ├── globals.css
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── resend-verification/page.tsx
│   └── (main)/
│       ├── layout.tsx                # WRONG: Wraps everything in ProtectedRoute
│       ├── page.tsx                  # Duplicate of root
│       ├── dashboard/page.tsx
│       ├── posts/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   ├── [slug]/page.tsx
│       │   └── [slug]/edit/page.tsx
│       ├── bookmarks/page.tsx
│       ├── following/page.tsx
│       ├── history/page.tsx
│       ├── notifications/page.tsx
│       ├── analytics/page.tsx
│       ├── search/page.tsx
│       ├── tags/page.tsx
│       ├── tags/[name]/page.tsx
│       ├── profile/settings/page.tsx
│       ├── profile/[id]/page.tsx
│       ├── users/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── ui/                           # 16 components (Button, Input, Card, etc.)
│   ├── layout/                       # Header, Sidebar, Footer, MainLayout, ProtectedRoute, AuthLayout
│   ├── forms/                        # LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm
│   └── editor/                       # (empty - not implemented)
├── features/
│   └── auth/                         # useAuth, authService, types
├── hooks/                            # (empty)
├── lib/
│   ├── api.ts                        # Basic fetch wrapper
│   ├── queryClient.ts                # TanStack Query config
│   ├── constants.ts                  # Routes, query keys, enums
│   ├── utils.ts                      # cn utility
│   ├── validations.ts                # Zod schemas
│   └── date.ts
├── providers/
│   ├── Providers.tsx                 # QueryProvider + AuthProvider + ToastProvider
│   ├── QueryProvider.tsx
│   └── AuthProvider.tsx
├── services/                         # (empty - should contain feature services)
├── types/
│   ├── api.ts                        # ApiResponse, PaginatedResponse
│   ├── user.ts                       # User, CurrentUser (mismatched with backend)
│   ├── post.ts                       # Post, ContentBlock, Tag
│   ├── comment.ts                    # Comment
│   ├── notification.ts               # Notification
│   └── index.ts
└── utils/
```

## B. Current Backend Structure

```
server/
├── prisma/schema.prisma              # Complete data model
├── src/
│   ├── app.js                        # Express app with all routes
│   ├── config/
│   ├── middleware/
│   │   ├── auth.middleware.js        # protect, verifiedOnly, optionalAuth, restrictTo
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validate.js
│   ├── modules/
│   │   ├── auth/                     # register, login, logout, me, refresh, forgot/reset password, verify email
│   │   ├── post/                     # CRUD + search
│   │   ├── comment/                  # Threaded comments + replies
│   │   ├── like/                     # Post/comment likes + status
│   │   ├── bookmarks/                # Bookmark CRUD + status
│   │   ├── follow/                   # Follow/unfollow + lists
│   │   ├── notifications/            # CRUD + unread count + system broadcast
│   │   ├── history/                  # Reading history
│   │   ├── search/                   # Global search + suggestions + trending + history
│   │   ├── tag/                      # Tags + tag posts
│   │   ├── user/                     # User posts
│   │   ├── analytics/                # Views + user/admin analytics
│   │   ├── ai/                       # 15 AI endpoints (NVIDIA API)
│   │   ├── settings/                 # Profile, email, password, privacy, notifications, preferences, avatar, cover, delete
│   │   ├── media/                    # Media upload/replace/delete
│   │   ├── seo/                      # SEO meta
│   │   ├── reports/                  # Reporting
│   │   └── admin/                    # Admin-only routes
│   ├── services/
│   │   ├── email.service.js
│   │   └── storage/
│   └── utils/
```

## C. Backend API Endpoint Map

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | Public | Register user |
| POST | /login | Public | Login (sets httpOnly cookies) |
| POST | /refresh | Cookie | Refresh access token |
| POST | /forgot-password | Public | Request password reset |
| POST | /reset-password | Public | Reset password with token |
| POST | /verify-email | Public | Verify email with token |
| POST | /resend-verification | Public | Resend verification email |
| GET | /me | Protected | Get current user |
| POST | /logout | Protected | Logout |

### Posts (`/api/posts`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | Public | List published posts |
| GET | /search | Public | Search posts |
| GET | /:slug | Optional | Get post by slug |
| POST | / | Verified | Create post (multipart) |
| PUT | /:id | Verified | Update post (multipart) |
| DELETE | /:id | Verified | Delete post |

### Comments (`/api`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /posts/:postId/comments | Optional | Get threaded comments |
| GET | /comments/:id/replies | Optional | Get replies |
| POST | /posts/:postId/comments | Verified | Create root comment |
| POST | /comments/:id/replies | Verified | Create reply |
| PATCH | /comments/:id | Verified | Update comment |
| DELETE | /comments/:id | Verified | Delete comment |

### Likes (`/api`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /posts/:id/like | Protected | Toggle post like |
| POST | /comments/:id/like | Protected | Toggle comment like |
| GET | /posts/:id/likes | Optional | Get post likers |
| GET | /comments/:id/likes | Optional | Get comment likers |
| GET | /posts/:id/like-status | Protected | Get like status |
| GET | /comments/:id/like-status | Protected | Get like status |

### Bookmarks (`/api`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /me/bookmarks | Protected | Get my bookmarks |
| POST | /posts/:id/bookmark | Protected | Bookmark post |
| DELETE | /posts/:id/bookmark | Protected | Remove bookmark |
| GET | /posts/:id/bookmark/status | Protected | Get bookmark status |

### Follow (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /:userId/followers | Optional | Get followers |
| GET | /:userId/following | Optional | Get following |
| POST | /:userId/follow | Protected | Follow user |
| DELETE | /:userId/follow | Protected | Unfollow user |

### Notifications (`/api/notifications`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /unread-count | Protected | Get unread count |
| GET | / | Protected | Get notifications |
| PATCH | /read-all | Protected | Mark all read |
| PATCH | /:id/read | Protected | Mark as read |
| DELETE | /read | Protected | Delete all read |
| DELETE | /:id | Protected | Delete notification |

### Search (`/api/search`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | Optional | Global search |
| GET | /suggestions | Public | Get suggestions |
| GET | /trending | Public | Get trending |
| GET | /history | Protected | Get search history |
| DELETE | /history | Protected | Delete search history |
| GET | /popular-tags | Public | Get popular tags |
| GET | /authors | Public | Get discover authors |

### Tags (`/api/tags`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | Public | Get all tags |
| GET | /:name/posts | Public | Get posts by tag |
| POST | / | Admin | Create tag |
| DELETE | /:id | Admin | Delete tag |

### User (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /:id/posts | Optional | Get user posts |

### Analytics (`/api`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /posts/:id/view | Public | Record view |
| GET | /posts/:id/analytics | Public | Get post analytics |
| GET | /me/analytics | Protected | Get my analytics |
| GET | /me/posts/analytics | Protected | Get my posts analytics |
| GET | /me/posts/top | Protected | Get top posts |
| GET | /admin/analytics | Admin | Get admin analytics |

### AI (`/api/ai`) - All Protected + Rate Limited
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /generate-post | Generate blog post |
| POST | /title | Generate titles |
| POST | /title/improve | Improve title |
| POST | /excerpt | Generate excerpt |
| POST | /tags | Generate tags |
| POST | /seo | Generate SEO |
| POST | /improve | Improve writing |
| POST | /rewrite | Rewrite content |
| POST | /expand | Expand content |
| POST | /shorten | Shorten content |
| POST | /continue | Continue writing |
| POST | /summarize | Summarize content |
| POST | /faq | Generate FAQ |
| POST | /social | Generate social posts |
| POST | /suggestions | Generate suggestions |
| POST | /suggestions/apply | Apply suggestions |

### Settings (`/api`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /me/settings | Protected | Get settings |
| PATCH | /me/profile | Protected | Update profile |
| PATCH | /me/email | Protected | Change email |
| GET | /me/email/verify | Public | Verify new email |
| PATCH | /me/password | Protected | Change password |
| PATCH | /me/privacy | Protected | Update privacy |
| PATCH | /me/notifications | Protected | Update notification prefs |
| PATCH | /me/preferences | Protected | Update preferences |
| POST | /me/avatar | Protected | Upload avatar |
| POST | /me/cover | Protected | Upload cover |
| DELETE | /me/avatar | Protected | Delete avatar |
| DELETE | /me/cover | Protected | Delete cover |
| DELETE | /me | Protected | Delete account |

### Media (`/api`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /me/media | Protected | Get my media |
| POST | /media | Protected | Upload media |
| PATCH | /media/:id | Protected | Replace media |
| DELETE | /media/:id | Protected | Delete media |

### SEO (`/api/posts`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /:id/seo | Public | Get SEO |
| PATCH | /:id/seo | Protected | Update SEO |

## D. Authentication Flow

1. **Registration**: POST `/api/auth/register` → returns user (no tokens), sends verification email
2. **Login**: POST `/api/auth/login` → sets httpOnly cookies (accessToken 15min, refreshToken 30 days), returns sanitized user
3. **Session**: Middleware `protect` reads accessToken from cookie, verifies JWT, fetches user from DB
4. **Token Refresh**: On 401 (expired access), middleware uses refreshToken cookie to get new tokens, sets new cookies, retries request
5. **Logout**: POST `/api/auth/logout` → deletes session from DB, clears cookies
6. **Email Verification**: Required before login. POST `/api/auth/verify-email` with token
7. **Password Reset**: POST `/api/auth/forgot-password` → email with token → POST `/api/auth/reset-password` with token + new password

**Cookie Configuration:**
- httpOnly: true
- secure: production only
- sameSite: 'strict'
- accessToken: 15 minutes
- refreshToken: 30 days

## E. Existing Frontend Problems

1. **Route Group Misuse**: `(main)/layout.tsx` wraps ALL routes in `ProtectedRoute`, but landing page at `/` should be PUBLIC
2. **Duplicate Routes**: `/` exists in both root and `(main)/page.tsx`
3. **Wrong Auth Endpoints**: `authService` calls `/api/auth/change-password`, `/api/auth/profile`, `/api/auth/account` - these don't exist (they're in `/api/settings` and `/api/me`)
4. **Type Mismatches**: 
   - Frontend `CurrentUser` has `isVerified`, `twoFactorEnabled`, `preferences` - backend has `isEmailVerified`, no 2FA, different prefs
   - Frontend `User` has `avatar`, `twitter`, `github`, `linkedin` - backend has `image`, `socialLinks` (JSON), `coverImage`
5. **API Client**: Uses `credentials: 'include'` but doesn't handle cookie-based auth properly; assumes token in localStorage
6. **No Service Layer**: Components call `api.get/post` directly instead of feature services
7. **Missing Features**: Most pages are skeletons/placeholders (posts, bookmarks, history, notifications, analytics, search, tags, settings)
8. **Admin References**: Header/Sidebar show "Admin Dashboard" for ADMIN role - but admin frontend doesn't exist
9. **Landing Page Claims**: Mentions GPT-4, Claude, local models, collaborative editing, revenue tracking, thousands of creators - NOT in backend
10. **ProtectedRoute Issues**: Uses `router.push` instead of `router.replace`; doesn't preserve query params in callbackUrl
11. **Query Keys**: Flat structure instead of feature-based; inconsistent naming
12. **Post Content Format**: Backend uses TipTap JSON, frontend types assume `ContentBlock[]` but editor not implemented
13. **No Error/Loading/Empty States**: Most pages lack proper states
14. **Sidebar Mobile Logic**: Conflicting transform logic for collapsed/mobile states

## F. Duplicate/Conflicting Routes

| Route | Current Location | Issue |
|-------|------------------|-------|
| `/` | `app/page.tsx` AND `app/(main)/page.tsx` | Duplicate |
| `/posts` | `app/(main)/posts/page.tsx` | Should be public |
| `/posts/[slug]` | `app/(main)/posts/[slug]/page.tsx` | Should be public |
| `/search` | `app/(main)/search/page.tsx` | Should be public |
| `/tags` | `app/(main)/tags/page.tsx` | Should be public |
| `/tags/[name]` | `app/(main)/tags/[name]/page.tsx` | Should be public |
| `/users/[username]` | `app/(main)/users/[username]/page.tsx` | Should be public |

## G. Features Actually Supported by Backend

✅ User authentication (register, login, logout, refresh, email verification, password reset)
✅ Posts (CRUD, search, pagination, drafts, publishing, SEO, tags)
✅ Comments (threaded, unlimited nesting, replies, edit/delete)
✅ Likes (posts + comments, status, lists)
✅ Bookmarks (CRUD, status, pagination)
✅ Following (follow/unfollow, followers/following lists)
✅ Notifications (CRUD, unread count, mark read, types: LIKE, COMMENT, COMMENT_REPLY, FOLLOW, POST_PUBLISHED, POST_FEATURED, MENTION, SYSTEM)
✅ Reading History (CRUD, pagination)
✅ Search (global, suggestions, trending, history, popular tags, discover authors)
✅ Tags (list, tag posts, admin create/delete)
✅ Analytics (post views, user analytics, top posts, admin analytics)
✅ AI (15 endpoints for content generation/improvement)
✅ Settings (profile, email, password, privacy, notifications, preferences, avatar, cover, delete account)
✅ Media (upload, replace, delete, list)
✅ User profiles (public posts by user)

## H. Features Claimed by Frontend But NOT Supported

❌ GPT-4 / Claude / local models (backend uses NVIDIA API only)
❌ Collaborative editing
❌ Revenue tracking
❌ Thousands of creators
❌ Admin dashboard
❌ Two-factor authentication
❌ Social links (twitter, github, linkedin as separate fields - backend uses JSON `socialLinks`)
❌ Custom themes (backend has `themePreference` string only)
❌ Email/push notification preferences as separate booleans (backend uses JSON `notificationPreferences`)

## I. Proposed Final Frontend Structure

```
client/src/
├── app/
│   ├── layout.tsx                    # Root layout (public)
│   ├── page.tsx                      # Landing page (public) - FIXED claims
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx                # Auth layout (no sidebar/header)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── resend-verification/page.tsx
│   └── (app)/
│       ├── layout.tsx                # Protected app layout with Header/Sidebar
│       ├── page.tsx                  # Redirect to /dashboard
│       ├── dashboard/page.tsx
│       ├── posts/
│       │   ├── page.tsx              # Public post listing
│       │   ├── new/page.tsx          # Create post (verified)
│       │   └── [slug]/
│       │       ├── page.tsx          # Public post detail
│       │       └── edit/page.tsx     # Edit post (verified, owner)
│       ├── bookmarks/page.tsx        # Protected
│       ├── following/page.tsx        # Protected
│       ├── history/page.tsx          # Protected
│       ├── notifications/page.tsx    # Protected
│       ├── analytics/page.tsx        # Protected
│       ├── search/page.tsx           # Public
│       ├── tags/
│       │   ├── page.tsx              # Public tag list
│       │   └── [name]/page.tsx       # Public tag posts
│       ├── profile/
│       │   └── page.tsx              # Protected - current user profile
│       ├── settings/
│       │   └── page.tsx              # Protected
│       └── users/
│           └── page.tsx              # Public user discovery
│
├── components/
│   ├── ui/                           # Button, Input, Card, Modal, Dropdown, Avatar, Badge, Tabs, Tooltip, Toast, Spinner, Skeleton, Pagination, Textarea, PasswordInput, FloatingParticles, CrtBackground, BackgroundPaths, TechText
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── navigation/                   # MobileNav, UserMenu, SearchBar
│   ├── forms/                        # Reusable form components
│   ├── editor/                       # PostEditor, Toolbar, extensions
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── PostHeader.tsx
│   │   ├── PostMeta.tsx
│   │   ├── PostActions.tsx
│   │   ├── PostContent.tsx
│   │   └── PostEditor.tsx
│   ├── comments/
│   │   ├── Comment.tsx
│   │   ├── CommentTree.tsx
│   │   ├── CommentComposer.tsx
│   │   └── CommentActions.tsx
│   ├── users/
│   │   ├── UserCard.tsx
│   │   ├── UserAvatar.tsx
│   │   └── FollowButton.tsx
│   ├── analytics/
│   │   ├── Chart.tsx
│   │   ├── MetricCard.tsx
│   │   └── PostAnalyticsTable.tsx
│   └── shared/
│       ├── LoadingState.tsx
│       ├── ErrorState.tsx
│       ├── EmptyState.tsx
│       └── PageHeader.tsx
│
├── features/
│   ├── auth/
│   │   ├── useAuth.ts
│   │   ├── authService.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── posts/
│   │   ├── postsService.ts
│   │   ├── usePosts.ts
│   │   ├── usePost.ts
│   │   ├── useCreatePost.ts
│   │   ├── useUpdatePost.ts
│   │   └── index.ts
│   ├── comments/
│   ├── likes/
│   ├── bookmarks/
│   ├── tags/
│   ├── users/
│   ├── following/
│   ├── notifications/
│   ├── history/
│   ├── analytics/
│   ├── search/
│   └── ai/
│
├── hooks/
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
│
├── lib/
│   ├── api/
│   │   ├── client.ts                 # Centralized API client
│   │   ├── errors.ts                 # ApiError class
│   │   └── config.ts                 # Base URL, interceptors
│   ├── queryClient.ts
│   ├── queryKeys.ts                  # Feature-based query keys
│   ├── constants.ts                  # Routes, enums
│   ├── utils.ts                      # cn, formatters
│   ├── validations.ts                # Zod schemas
│   └── date.ts
│
├── providers/
│   ├── Providers.tsx
│   ├── QueryProvider.tsx
│   ├── AuthProvider.tsx
│   └── ToastProvider.tsx
│
├── services/                         # Feature-specific services
│   ├── auth.service.ts
│   ├── posts.service.ts
│   ├── comments.service.ts
│   ├── likes.service.ts
│   ├── bookmarks.service.ts
│   ├── tags.service.ts
│   ├── users.service.ts
│   ├── following.service.ts
│   ├── notifications.service.ts
│   ├── history.service.ts
│   ├── analytics.service.ts
│   ├── search.service.ts
│   ├── ai.service.ts
│   ├── settings.service.ts
│   └── media.service.ts
│
├── types/
│   ├── auth.ts                       # Auth-related types
│   ├── user.ts                       # User, CurrentUser (matching backend)
│   ├── post.ts                       # Post, PostListItem, ContentBlock, Tag
│   ├── comment.ts                    # Comment, CommentTree
│   ├── notification.ts               # Notification
│   ├── analytics.ts                  # Analytics types
│   ├── search.ts                     # Search types
│   ├── api.ts                        # ApiResponse, PaginatedResponse
│   ├── settings.ts                   # Settings types
│   └── index.ts
│
├── constants/
│   ├── routes.ts
│   ├── queryKeys.ts
│   ├── enums.ts
│   └── index.ts
│
└── utils/
    ├── formatters.ts
    ├── validators.ts
    └── helpers.ts
```

## J. Migration Plan

### Phase 1: Clean App Router Structure
1. Remove `(main)/page.tsx` duplicate
2. Move public routes out of `(main)` route group
3. Create `(app)` route group for protected routes only
4. Fix route structure to match target

### Phase 2: API Layer & Types
1. Create `lib/api/client.ts` with proper cookie handling
2. Create `lib/api/errors.ts` with ApiError
3. Create feature services in `services/`
4. Fix TypeScript types to match backend responses exactly
5. Create feature-based query keys in `lib/queryKeys.ts`

### Phase 3: Authentication Architecture
1. Fix `useAuth` to work with cookie-based auth (no localStorage tokens)
2. Implement proper session restoration on page load
3. Fix `ProtectedRoute` to use `router.replace` and preserve callback URL with query params
4. Handle email verification requirement properly
5. Remove fake auth endpoints (change-password, etc.)

### Phase 4: Application Shell
1. Rebuild Header with proper auth state, search, notifications
2. Rebuild Sidebar with clean responsive logic (no conflicting transforms)
3. Fix mobile navigation
4. Add user menu with proper links

### Phase 5: Dashboard
1. Implement real dashboard with user stats
2. Connect to `/api/me/analytics`

### Phase 6: Posts
1. Post listing with pagination, infinite scroll
2. Post detail with TipTap content rendering
3. Post creation with TipTap editor
4. Post editing with ownership check
5. SEO metadata on post detail

### Phase 7: Comments + Likes + Bookmarks
1. Recursive comment tree component
2. Comment composer (create/reply/edit/delete)
3. Like buttons with optimistic updates
4. Bookmark buttons with status

### Phase 8: Users + Profiles + Following
1. Public user profile pages
2. Follow/unfollow buttons
3. Followers/following lists
4. Current user profile page

### Phase 9: Search + Tags + History + Notifications
1. Search page with URL query params
2. Tag pages
3. Reading history
4. Notifications with real-time unread count

### Phase 10: Analytics
1. ECharts integration for charts
2. User analytics dashboard
3. Post analytics table

### Phase 11: Settings
1. Profile settings
2. Account settings (email, password)
3. Privacy settings
4. Notification preferences
4. Preferences (language, timezone, theme)
5. Avatar/cover upload
6. Delete account

### Phase 12: SEO + Accessibility + States
1. Dynamic metadata for public pages
2. Semantic HTML, ARIA labels
3. Loading/error/empty states for all pages
4. Responsive design fixes

### Phase 13: Cleanup
1. Remove dead code, unused components
2. Fix all TypeScript/ESLint errors
3. Production build verification