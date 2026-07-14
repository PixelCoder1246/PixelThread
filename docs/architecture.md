# Architecture Documentation

## Overview

PixelThread is an **AI-powered blogging platform** built as a monorepo with a Next.js frontend and a Node.js/Express backend. The database layer is managed by Prisma ORM connected to a Supabase (PostgreSQL) database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16+, React 19, TypeScript, CSS Modules |
| **Backend** | Node.js, Express 4, Prisma ORM 7 |
| **Database** | PostgreSQL (hosted on Supabase) |
| **Tooling** | ESLint, Prettier, Husky, lint-staged |
| **CI/CD** | GitHub Actions (parallel linting via matrix strategy) |

---

## Monorepo Structure

```
PixelThread/
├── .github/
│   ├── workflows/
│   │   └── lint.yaml           # CI: parallel lint for client + server
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/
│   └── pre-commit              # Runs lint-staged on every commit
├── client/                     # Next.js frontend
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # Shared UI components
│   │   ├── features/           # Feature-scoped modules
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Third-party integrations (e.g. auth)
│   │   ├── services/           # API call functions
│   │   ├── config/             # App-level config constants
│   │   ├── types/              # Shared TypeScript types
│   │   ├── utils/              # Utility/helper functions
│   │   └── constants/          # App-wide constants
│   └── public/                 # Static assets
├── server/                     # Express backend API
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   ├── seed.js             # Database seeding script
│   │   └── migrations/         # Prisma migration history
│   ├── src/
│   │   ├── app.js              # Express app instance
│   │   ├── config/             # DB and app config (db.js)
│   │   ├── middleware/         # Custom Express middleware (auth, errorHandler)
│   │   ├── services/           # Shared services (email.service.js, seo/)
│   │   ├── lib/
│   │   ├── modules/            # Feature modules (module-per-feature pattern)
│   │   │   ├── auth/           # Auth feature module (v0.3.0)
│   │   │   │   ├── auth.routes.js      # Route definitions
│   │   │   │   ├── auth.controller.js  # Thin request handlers
│   │   │   │   └── auth.service.js     # Business logic (register, login, tokens, etc.)
│   │   │   ├── post/           # Post feature module (v0.3.0)
│   │   │   │   ├── post.routes.js      # Route definitions
│   │   │   │   ├── post.controller.js  # Thin request handlers
│   │   │   │   ├── post.service.js     # Prisma queries + business logic
│   │   │   │   └── post.validation.js  # Input validation (throws ApiError)
│   │   │   ├── user/           # User feature module (v0.3.0)
│   │   │   │   ├── user.routes.js      # Route definitions
│   │   │   │   ├── user.controller.js  # Thin request handlers
│   │   │   │   ├── user.service.js     # Business logic (fetch user posts)
│   │   │   │   └── user.validation.js  # Input validation (throws ApiError)
│   │   │   ├── analytics/     # Analytics feature module (v0.3.0)
│   │   │   │   ├── analytics.routes.js    # Route definitions
│   │   │   │   ├── analytics.controller.js # Thin request handlers
│   │   │   │   └── analytics.service.js   # Business logic (views, analytics queries)
│   │   │   ├── seo/            # SEO feature module (v0.3.0)
│   │   │   │   ├── seo.routes.js          # Route definitions
│   │   │   │   ├── seo.controller.js      # Thin request handlers
│   │   │   │   └── seo.validation.js      # Input validation (throws ApiError)
│   │   │   ├── comment/        # Comment feature module (v0.3.0)
│   │   │   │   ├── comment.routes.js      # Route definitions
│   │   │   │   ├── comment.controller.js  # Thin request handlers
│   │   │   │   ├── comment.service.js     # Business logic (CRUD, tree builder, recursive delete)
│   │   │   │   └── comment.validation.js  # Input validation (throws ApiError)
│   │   │   ├── like/          # Like feature module (v0.3.0)
│   │   │   │   ├── like.routes.js        # Route definitions
│   │   │   │   ├── like.controller.js    # Thin request handlers
│   │   │   │   └── like.service.js       # Business logic (toggle, query likes)
│   │   │   └── ai/            # AI feature module (v0.4.0)
│   │   │       ├── ai.routes.js          # Route definitions (15 endpoints)
│   │   │       ├── ai.controller.js      # Thin request handlers
│   │   │       ├── ai.service.js         # NVIDIA API integration + generation logic
│   │   │       ├── ai.validation.js      # Input validation (throws ApiError)
│   │   │       ├── ai.constants.js       # Tone, category, length constants
│   │   │       ├── ai.prompts.js         # System/user prompt templates
│   │   │       └── ai.utils.js           # JSON extraction, token usage builder
│   │   └── utils/              # Utility/helper functions (ApiError, ApiResponse, jwt, slug.util.js, upload.util.js)
│   ├── prisma.config.ts        # Prisma 7 configuration file
│   └── server.js               # Entry point (bootstraps Express)
├── docs/                       # Project documentation
├── .editorconfig               # Editor formatting standards
├── .gitignore
├── CHANGELOG.md
├── LICENSE
├── README.md
└── package.json                # Root: npm workspaces + Husky
```

---

## Key Design Decisions

### Monorepo with npm Workspaces
Both `client` and `server` are managed from the root using npm workspaces. This allows a single `npm install` to set up the entire project and enables root-level scripts to run commands across all workspaces.

### Prisma 7 with Driver Adapters
Prisma 7 removed the built-in Rust engine and now requires explicit **driver adapters**. The server uses `@prisma/adapter-pg` with a `pg.Pool`. Configuration lives in `prisma.config.ts` — the `schema.prisma` file only defines models.

### Supabase Session Pooler
Since Supabase direct connections require IPv6, all application traffic is routed through the **Session Pooler** (`aws-1-ap-southeast-1.pooler.supabase.com`). The `DIRECT_URL` is kept for CLI tools (Prisma migrations).

### Pre-commit Hooks
Husky runs `lint-staged` on every commit, applying ESLint and Prettier to only the changed files. This prevents lint errors from ever reaching the repository.

### CI via GitHub Actions
The `lint.yaml` workflow uses a **matrix strategy** to lint `client` and `server` in parallel, with **path filters** so CI only runs when relevant directories are modified, and **dependency caching** for speed.

### Secure Cookie-Based Authentication
Access tokens (`15m` expiry) and refresh tokens (`30d` expiry) are issued as secure `HttpOnly` cookies. Refresh tokens are hashed via SHA-256 before being stored in the database. A token rotation strategy (revoking the old session and generating a new session upon refresh) mitigates replay attacks. Email verification status is enforced across restricted endpoints.

### Authentication Middleware
| Middleware | Purpose |
|---|---|
| `protect` | Reads `accessToken` from cookies, verifies it, and attaches `req.user`. On `TokenExpiredError`, attempts silent refresh. |
| `verifiedOnly` | Returns 403 if `req.user.isEmailVerified` is false. Must follow `protect`. |
| `restrictTo(...roles)` | Returns 403 if `req.user.role` is not in the specified roles. Must follow `protect`. |
| `optionalAuth` | Like `protect`, but silently continues if no token is present or the token is invalid. Used by public-read endpoints that optionally expose user-specific data (e.g., `isLiked` on comments). |

### Silent Token Refresh
The `protect` middleware automatically refreshes expired access tokens using the refresh token cookie — no 401 responses are returned due to token expiry. The middleware verifies the refresh token, checks the DB session, generates a new access + refresh token pair (with full session rotation), sets the new cookies, and continues the request to the route handler seamlessly.

### Module-Per-Feature Architecture
All features are implemented as self-contained modules under `src/modules/<feature>/`. Each module owns its routes, controller, service, validation, and utilities — making it easy to isolate, test, and extend each domain. This pattern ensures a clean, organized, and scalable codebase.

### Post Slug Strategy
Slugs are auto-generated from the post title using a `slugify()` function (lowercase, hyphenated, stripped special chars). If the base slug conflicts with an existing post, a numeric suffix is appended (`-2`, `-3`, …). On title updates, the slug is regenerated and uniqueness is re-enforced, excluding the post being updated from the conflict check.

### Tag Upsert Pattern
Tags are normalised to lowercase and stored with a unique `name` constraint. When a post is created or updated, the service calls `prisma.tag.upsert()` for each tag name — creating missing tags and retrieving IDs for existing ones — then links them to the post via the `PostTag` junction table. On update, all existing `PostTag` rows are deleted first, then recreated.

### Post Search
Full-text search across `title`, `excerpt`, `content` (JSON blocks), tag names, and author name via `GET /api/posts/search`. Supports multiple sort modes: `relevance` (title→excerpt match scoring with newest tiebreaker), `newest`, `oldest`, `mostViewed`, `mostLiked`. Only returns `PUBLISHED` + `PUBLIC` posts. Uses Prisma's `contains` with `mode: 'insensitive'` for case-insensitive matching.

### AI Content Generation
The AI module (`/api/ai`) provides 15 endpoints for content generation via NVIDIA's API (OpenAI-compatible). All endpoints are rate-limited to 10 req/min per user and require authentication. Every request is logged to the `AIGeneration` table with the user ID, generation type, and truncated prompt/response for audit and analytics. The backend uses a modular prompt system with separate system prompts and user prompt builders for each generation type, extracted to `ai.prompts.js`.

---

## Database Schema Overview

| Model | Purpose |
|---|---|
| `User` | Platform users with email/password auth |
| `Session` | User sessions (`sessionToken`, `expires`, `ipAddress`, `userAgent`) |
| `Post` | Blog posts with slug, status, visibility |
| `SeoMeta` | Per-post SEO metadata and score |
| `Tag` / `PostTag` | Tagging system (many-to-many) |
| `Comment` | Nested comments with self-referential `parent` relation |
| `Like` | Likes on posts and comments |
| `AIGeneration` | Log of AI generation requests (type, prompt, response) — supports 14 generation types |
| `PostAnalytics` | Views and likes count per post |
