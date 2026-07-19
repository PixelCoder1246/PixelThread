# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2026-07-19

### Added
- **Reports module** at `server/src/modules/reports/`:
  - 9 endpoints for content moderation: report post/comment/user, admin get/list/change/resolve/reject/analytics.
  - Reporting with reason classification (`SPAM`, `HARASSMENT`, `HATE_SPEECH`, `MISINFORMATION`, `COPYRIGHT`, `ADULT_CONTENT`, `VIOLENCE`, `IMPERSONATION`, `OTHER`).
  - Report workflow: `PENDING` → `UNDER_REVIEW` → `RESOLVED` / `REJECTED` with resolution actions.
  - Unique constraint per reporter + referenceId + reportType (no duplicate reports).
  - `report.constants.js` — All enums and validation constants.
  - `report.validation.js` — Input validation for all report endpoints.
- **Notifications module** at `server/src/modules/notifications/`:
  - 7 endpoints: list, unread count, mark read, mark all read, delete, delete read, admin broadcast.
  - 8 notification types: `LIKE`, `COMMENT`, `COMMENT_REPLY`, `FOLLOW`, `POST_PUBLISHED`, `POST_FEATURED`, `MENTION`, `SYSTEM`.
  - Automatic notification creation on like, comment, reply, and follow actions.
- **Follow module** at `server/src/modules/follow/`:
  - 4 endpoints: follow, unfollow, get followers, get following.
  - Self-follow prevention and duplicate follow detection.
  - Automatic `FOLLOW` notification on follow.
- **Search module** at `server/src/modules/search/`:
  - 7 endpoints: global search, suggestions, trending, history, clear history, popular tags, discover authors.
  - Cross-entity search (posts, users, tags) with relevance sorting.
  - Autocomplete suggestions, trending keywords, and user search history.
  - Rate-limited to 30 req/min per IP.
- **Bookmarks module** at `server/src/modules/bookmarks/`:
  - 4 endpoints: bookmark, remove bookmark, get my bookmarks, check status.
  - Only public published posts can be bookmarked.
- **Reading History module** at `server/src/modules/history/`:
  - 3 endpoints: get history, delete entry, clear all.
  - Automatic tracking when authenticated users view posts.
  - Tracks `lastReadAt` and `readCount` per post.

### Changed
- All documentation updated to reflect new modules.
- `createdAPIs.md`: renumbered search endpoints (69-75 → 76-82), added reports section (83-91).
- Bumped all package versions to `0.6.0`.

## [0.2.1] - 2026-07-01

### Added
- **User module** at `server/src/modules/user/`:
  - `user.service.js` — `getUserPosts()` with ownership-based visibility filtering (DRAFT/PRIVATE for owner, PUBLISHED/PUBLIC for others), pagination, and ordering.
  - `user.controller.js` — Thin controller delegating to user service, returning `sendSuccess()`.
  - `user.routes.js` — Route definition: `GET /:id/posts` (optional auth).
  - `user.validation.js` — `validateUserPostsQuery` helper for pagination and sort params.
- **Post search** at `server/src/modules/post/`:
  - `searchPosts()` in `post.controller.js` — New controller for searching posts.
  - `searchPosts()` in `post.service.js` — Full-text search across title, excerpt, content (JSON), tags, and author name with `relevance`, `newest`, `oldest`, `mostViewed`, `mostLiked` sort modes.
  - `validateSearchPosts()` in `post.validation.js` — Input validation for search query, tag, authorId filters, pagination, and sort.
  - Route `GET /api/posts/search` (public).
- **`optionalAuth` middleware** in `auth.middleware.js` — Attaches user to `req` if a valid token is present, silently continues if not. Used by user posts endpoint.
- `GET /api/users/:id/posts` — New endpoint returning user's posts with visibility gating.
- `GET /api/posts/search` — New endpoint for searching published public posts.

### Changed
- `server/src/app.js`: registered `userRoutes` at `/api/users`.
- `docs/api.md`: updated status to v0.3.0.
- `docs/architecture.md`: updated module version markers to v0.3.0.
- `createdAPIs.md`: added documentation for user and search endpoints.
- Bumped all package versions to `0.2.1`.

## [0.2.0] - 2026-06-22

### Added
- Implemented full V1 Post module at `server/src/modules/post/`:
  - `slug.util.js` — `slugify()` converter and `generateUniqueSlug()` with numeric increment strategy and DB uniqueness enforcement.
  - `post.validation.js` — `validateCreatePost`, `validateUpdatePost`, `validatePagination` helpers throwing `ApiError` for consistent error handling.
  - `post.service.js` — All Prisma queries: tag upsert via `tag.upsert`, `PostAnalytics` auto-creation on post creation, `PostTag` delete-then-recreate on update, owner/admin authorization, formatted response shape.
  - `post.controller.js` — Thin controllers delegating to service, returning `sendSuccess()` responses.
  - `post.routes.js` — Route definitions: `GET /` (public), `GET /:slug` (public), `POST /` (auth+verified), `PUT /:id` (auth+verified), `DELETE /:id` (auth+verified).
- 5 new API endpoints: `GET /api/posts`, `GET /api/posts/:slug`, `POST /api/posts`, `PUT /api/posts/:id`, `DELETE /api/posts/:id`.
- Tag auto-creation: missing tags are created via `upsert` on `Tag.name` (normalized to lowercase), linked through `PostTag` join table.
- `PostAnalytics` record (views=0, likes=0) created automatically alongside each new post.
- Ownership enforcement: only post author or `ADMIN` role may update or delete posts (checked in service layer).
- `ARCHIVED` status blocked during post creation; allowed only on update.
- `upload.util.js` — Multer config, `uploadToS3Mock()`, and `deletePostImages()` utility for cleaning up uploaded files from disk.
- **Silent token refresh**: `protect` middleware in `auth.middleware.js` now auto-refreshes expired access tokens via the refresh token cookie (with full session rotation) — users never see a 401 from token expiry.
- **Orphaned image cleanup**: `deletePostImages()` called in `post.service.js` before deleting a post, removing all associated uploaded files from disk.
- ESLint clean: 0 errors, 0 warnings across all new module files.

### Changed
- **Auth module refactored**: Auth routes and controller migrated from flat `controllers/` and `routes/` dirs to `modules/auth/`. Business logic extracted from `auth.controller.js` into new `auth.service.js` — matching the controller→service pattern established by the post module.
- `server/src/app.js`: route imports switched from `./routes/` to `./modules/<feature>/`.
- `server/src/routes/post.routes.js` and `server/src/routes/auth.routes.js`: deleted.
- `createdAPIs.md`: fully rewritten with complete Postman-ready documentation for all 15 endpoints (10 auth + 5 posts), including validation tables and full example request/response bodies.
- `docs/architecture.md`: updated to reflect the `modules/` structure and Post module design decisions.
- Bumped all package versions to `0.2.0`.

## [0.1.0] - 2026-06-21


### Added
- Created `server/src/routes/post.routes.js` with mock posts and post creation endpoints.
- Implemented `verifiedOnly` middleware in `server/src/middleware/auth.middleware.js` to restrict unverified users.
- Added `cookie-parser` dependency to backend.
- Created `createdAPIs.md` referencing HTTP-only cookie-based APIs and routes.

### Changed
- Migrated authentication token exchange from JSON bodies to HTTP-only secure cookies (`accessToken` and `refreshToken`).
- Implemented refresh token rotation with atomic database session regeneration and session revocation on logout.
- Hashed refresh tokens before storage in PostgreSQL using SHA-256.
- Updated `protect` middleware to parse tokens from cookie headers.
- Restricted login for accounts with unverified emails (`user.isEmailVerified === false`).
- Cleaned up unused imports/variables and resolved all linter warnings.
- Promoted all workspaces and root-level package versions to `0.1.0`.

## [0.0.0] - 2026-04-18

### Added

#### Monorepo & Workspace
- Root `package.json` with npm workspaces managing `client` and `server`.
- Root-level scripts: `dev`, `lint`, `format`, `build` — all delegated to workspaces.
- `Husky` and `lint-staged` for pre-commit code quality enforcement.
- `.editorconfig` for consistent indentation and line endings across all editors.
- Root `.gitignore` covering build artifacts, environment files, and editor metadata.

#### Frontend (Client)
- Next.js 16+ (App Router) with React 19 and TypeScript.
- ESLint v9 and Prettier configured with `eslint-config-next` and `eslint-config-prettier`.
- `client/src` folder organized into: `app`, `components`, `features`, `hooks`, `lib`, `services`, `config`, `types`, `utils`, `constants`.
- `.env.example` template with `NEXT_PUBLIC_API_URL`.

#### Backend (Server)
- Node.js + Express 4 entry point (`server.js`) with Helmet, CORS, Morgan, and body parsing middleware.
- `server/src` organized into: `config`, `controllers`, `routes`, `middleware`, `services`, `lib/ai`, `modules`, `utils`.
- Graceful shutdown handler for `SIGTERM`.
- ESLint v8 and Prettier configured.
- `server/.env.example` template with `PORT`, `NODE_ENV`, `DATABASE_URL`, `DIRECT_URL`.

#### Database (Prisma 7 + Supabase)
- Prisma 7 with `prisma.config.ts` for datasource configuration (replacing deprecated `schema.prisma` `url` field).
- PostgreSQL driver adapter (`@prisma/adapter-pg`) for Prisma 7 compatibility.
- Schema initialized with models: `User`, `Session`, `Post`, `SeoMeta`, `Tag`, `PostTag`, `Comment`, `Like`, `AIGeneration`, `PostAnalytics`.
- Enums: `PostStatus`, `Visibility`, `AIGenerationType`, `UserRole`.
- Supabase Session Pooler used as `DATABASE_URL` for IPv4 network compatibility.
- Seed script (`prisma/seed.js`) with initial test users.

#### CI/CD & Repository
- GitHub Actions workflow (`.github/workflows/lint.yaml`) with matrix strategy for parallel client/server linting, path filters, and dependency caching.
- Pull Request template (`.github/PULL_REQUEST_TEMPLATE.md`).
- MIT `LICENSE`.
- `CHANGELOG.md` (this file).
- `README.md` with full project overview, quick start, and documentation links.

#### Documentation (`docs/`)
- `setup.md` — Full installation, environment setup, and Prisma workflow.
- `architecture.md` — Full project structure, tech decisions, and database schema overview.
- `api.md` — Implemented and planned API endpoints.
- `ai-design.md` — AI feature vision, data model, and implementation roadmap.
