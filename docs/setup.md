# Setup Guide

## Prerequisites

- **Node.js** v20+
- **npm** v10+
- **Git**
- A **Supabase** (or PostgreSQL) database

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd PixelThread
```

---

## 2. Install All Dependencies

Run this once from the **root**. npm workspaces will install dependencies for both `client` and `server` automatically.

```bash
npm install
```

---

## 3. Configure Environment Variables

### Server
Copy the example file and fill in your values:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://<user>:<password>@<pooler-host>:5432/postgres"
DIRECT_URL="postgresql://<user>:<password>@<direct-host>:5432/postgres"
```

> **Note:** If you are on an IPv4 network (most home/office networks), use the **Session Pooler** URL as your `DATABASE_URL` and the direct host URL as your `DIRECT_URL`.

### Client
```bash
cp client/.env.example client/.env.local
```

Edit `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 4. Database Setup (Prisma)

All Prisma commands must be run from the `server/` directory.

```bash
cd server

# Apply schema to the database (creates tables)
npx prisma migrate dev --name init

# Regenerate the Prisma client after schema changes
npm run prisma:generate

# Seed the database with initial test data
npx prisma db seed

# Open Prisma Studio (visual database browser)
npm run prisma:studio
```

> **Note:** Prisma 7 requires the `prisma.config.ts` file for configuration. Do not add `url` to `schema.prisma` directly.

---

## 5. Run Development Servers

### Run Both (from root)
```bash
npm run dev
```

### Run Individually
```bash
# Frontend (Next.js) — http://localhost:3000
cd client && npm run dev

# Backend (Express) — http://localhost:5000
cd server && npm run dev
```

---

## 6. Code Quality

All commands can be run from the project root:

```bash
# Lint both client and server
npm run lint

# Format both client and server
npm run format
```

Pre-commit hooks are also active via **Husky**. Every `git commit` automatically runs `lint-staged` on changed files.

---

## 7. Initial Git Push

```bash
git add .
git commit -m "chore: initial project structure v0.0.0"
git remote add origin <your-github-url>
git push -u origin main
```
