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
│   │   ├── controllers/        # Route handler logic
│   │   ├── routes/             # Express route definitions
│   │   ├── middleware/         # Custom Express middleware
│   │   ├── services/           # Business logic layer
│   │   ├── lib/
│   │   │   └── ai/             # AI generation utilities (future)
│   │   ├── modules/            # Feature modules
│   │   └── utils/              # Utility/helper functions
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
| `AIGeneration` | Log of AI generation requests (type, prompt, response) |
| `PostAnalytics` | Views and likes count per post |
