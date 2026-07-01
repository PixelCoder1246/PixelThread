# PixelThread - AI Context

## Project Overview
**PixelThread** is an AI-assisted blogging platform where users create, optimize, and publish professional blog posts. It features built-in SEO tools and AI writing assistance. The application is divided into a frontend (Next.js) and a backend (Node.js/Express).

## Tech Stack
- **Frontend**: Next.js 16+, React 19, TypeScript
- **Backend**: Node.js, Express 4
- **Database**: PostgreSQL via Supabase, using Prisma ORM 7
- **Tooling**: ESLint, Prettier, Husky, lint-staged, GitHub Actions

## Directory Structure
```text
PixelThread/
├── client/          # Next.js frontend application (runs on http://localhost:3000)
├── server/          # Express backend API + Prisma + AI services (runs on http://localhost:5000)
├── docs/            # Extensive documentation (Architecture, API, Setup, AI design)
├── .github/         # CI workflows and pull request templates
├── createdAPIs.md   # Comprehensive documentation of all existing API endpoints
└── package.json     # Root workspace configuration
```

## Key Files to Reference
- **API Documentation**: Always check `createdAPIs.md` at the project root for the latest REST API endpoints, request/response structures, and authentication requirements.
- **Architecture & Design**: Check the `docs/` folder for `architecture.md`, `ai-design.md`, and `setup.md`.
- **Database Schema**: Located in `server/prisma/schema.prisma` (inferred from Prisma usage).

## Authentication & Authorization
- **Method**: Session-based auth using `HttpOnly` cookies (`accessToken` and `refreshToken`).
- **Roles**: `USER` and `ADMIN`.
- **Requirements**: Write endpoints (`POST`, `PUT`, `DELETE`) require a valid `accessToken` and email verification (`isEmailVerified: true`). Read endpoints for posts are generally public.

## Common Scripts
- `npm run dev` at the root starts both the client and server.
- Server database commands (run in `server/`): `npx prisma migrate dev`, `npx prisma db seed`.

## Guidelines for AI
- When modifying APIs, update `createdAPIs.md` to keep it accurate.
- Respect the existing project structure: place frontend components in `client/` and backend controllers/routes in `server/`.
- Ensure new endpoints follow the established authentication and error handling patterns.
