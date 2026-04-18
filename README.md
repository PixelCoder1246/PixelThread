# PixelThread

**PixelThread** is an AI-assisted blogging platform where users create, optimize, and publish professional blog posts with the help of AI — all with built-in SEO tools that ensure every post ranks well on search engines.

Users sign up, get access to an AI writing assistant, and can generate drafts, refine their content, get title suggestions, and receive a real-time SEO score before publishing — all from one seamless editor.

---

## Features

- **AI Writing Assistant**: Users get inline AI help to draft posts, rewrite sections, suggest titles, and refine their content — the AI guides, the user decides.
- **SEO Engine**: Every post gets a real-time SEO score. The AI suggests meta titles, descriptions, keywords, and canonical URLs to maximize search visibility.
- **Rich Blog Editor**: Full post management with slug control, tags, visibility settings (public/private), and publish scheduling.
- **Community Engagement**: Nested comment threads and a like system on posts and comments.
- **Post Analytics**: Built-in views and engagement tracking per post.
- **Secure Authentication**: Session-based auth with role management (`USER` / `ADMIN`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16+, React 19, TypeScript |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL via Supabase (Prisma ORM 7) |
| Tooling | ESLint, Prettier, Husky, lint-staged |
| CI/CD | GitHub Actions |

---

## Project Structure

```text
PixelThread/
├── client/          # Next.js frontend (user-facing blogging app)
├── server/          # Express backend API + Prisma + AI services
├── docs/            # Architecture, API, Setup, AI design docs
├── .github/         # CI workflows + PR template
└── package.json     # Root workspace config + Husky
```

---

## Quick Start

### 1. Clone and Install
```bash
git clone <repo-url>
cd PixelThread
npm install           # Installs deps for both client and server
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```
Fill in your Supabase connection strings and API URL.

### 3. Set Up the Database
```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start Development
```bash
# From root — starts both client and server
npm run dev
```

- **Frontend (Blog App)**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`

---

## 📖 Documentation

| Document | Description |
|---|---|
| [Setup Guide](./docs/setup.md) | Full installation and configuration steps |
| [Architecture](./docs/architecture.md) | Project structure, tech decisions, database schema |
| [API Reference](./docs/api.md) | Available and planned API endpoints |
| [AI Design](./docs/ai-design.md) | AI assistant vision, SEO engine, and implementation roadmap |

---

## 🔧 Scripts

Run from the **project root**:

```bash
npm run dev       # Start all services in development mode
npm run lint      # Lint client + server
npm run format    # Format client + server
npm run build     # Build all services for production
```

Run from **`server/`**:

```bash
npm run prisma:generate   # Regenerate Prisma client after schema changes
npm run prisma:studio     # Open visual database browser (Prisma Studio)
npx prisma migrate dev    # Apply schema changes to the database
npx prisma db seed        # Seed the database with test data
```

---

## ⚖️ License

MIT — see [LICENSE](./LICENSE).
