# Setup Guide

## Prerequisites

- **Node.js** v22+
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
LOG_LEVEL=debug
DATABASE_URL="postgresql://<user>:<password>@<pooler-host>:5432/postgres"
DIRECT_URL="postgresql://<user>:<password>@<direct-host>:5432/postgres"
JWT_ACCESS_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5000
```

> **Important**: Generate strong JWT secrets: `openssl rand -hex 64`

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

# Generate indexes for production performance
npx prisma migrate dev --name add_indexes

# Regenerate the Prisma client after schema changes
npm run prisma:generate

# Seed the database with initial test data
npx prisma db seed

# Open Prisma Studio (visual database browser)
npm run prisma:studio
```

> **Note**: Prisma 7 requires the `prisma.config.ts` file for configuration. Do not add `url` to `schema.prisma` directly.

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

## 6. Docker Deployment

### Build and Run with Docker Compose
```bash
# Set environment variables
export DATABASE_URL="postgresql://..."
export JWT_ACCESS_SECRET="..."
export JWT_REFRESH_SECRET="..."
export CLIENT_URL="https://yourdomain.com"

# Build and start
docker-compose up -d --build
```

### Production Checklist
- Generate strong JWT secrets: `openssl rand -hex 64`
- Set `NODE_ENV=production`
- Set `LOG_LEVEL=info`
- Configure a reverse proxy (Nginx) for SSL termination
- Set `STORAGE_PROVIDER=s3` for cloud storage
- Configure `CLIENT_URL` and `API_URL` with your production domain

---

## 7. Monitoring Endpoints

Once running, these endpoints are available:

| Endpoint | Description |
|---|---|
| `GET /health` | Simple health check (always returns 200 if server is up) |
| `GET /ready` | Readiness probe — checks database, storage, and AI connectivity |
| `GET /metrics` | Prometheus-format metrics (request counts, uptime) |

---

## 8. Code Quality

All commands can be run from the project root:

```bash
# Lint both client and server
npm run lint

# Format both client and server
npm run format
```

Pre-commit hooks are also active via **Husky**. Every `git commit` automatically runs `lint-staged` on changed files.

---

## 9. Initial Git Push

```bash
git add .
git commit -m "chore: initial project structure v0.0.0"
git remote add origin <your-github-url>
git push -u origin main
```
