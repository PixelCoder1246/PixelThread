# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
