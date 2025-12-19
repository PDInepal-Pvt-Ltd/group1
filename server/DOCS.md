# 🍽️ Restaurant Management System (RMS)

**Repository:** `rms` — A modular, production-minded web + mobile prototype for small-to-medium restaurants. Built to demonstrate a full order-to-bill workflow with QR ordering, Kitchen Display System (KDS), billing, and a surplus (flash-sale) feature to reduce food waste.

---

## Table of contents

1. [Project Brief](#project-brief)
2. [Key Features](#key-features)
3. [Architecture & Tech Stack](#architecture--tech-stack)
4. [Repository Layout](#repository-layout)
5. [Getting started (local development)](#getting-started-local-development)
   - [Prerequisites](#prerequisites)
   - [Environment variables](#environment-variables)
   - [Database & Prisma](#database--prisma)
   - [Run backend](#run-backend)
   - [Run frontend](#run-frontend)
   - [Run mobile (Flutter)](#run-mobile-flutter)

6. [Scripts & Commands](#scripts--commands)
7. [Testing](#testing)
8. [API & Contracts](#api--contracts)
9. [Deployment](#deployment)
10. [Operational notes (DB, backups, pruning)](#operational-notes-db-backups-pruning)
11. [Security & Privacy](#security--privacy)
12. [Contributing & Workflow](#contributing--workflow)
13. [Roadmap & Extensions](#roadmap--extensions)
14. [Troubleshooting & FAQs](#troubleshooting--faqs)
15. [Acknowledgements & License](#acknowledgements--license)

---

## Project Brief

`RMS` is an integrated system to manage restaurant operations: tables, reservations, orders, kitchen flow (KDS), billing, and customer QR ordering. It is opinionated toward simplicity, testability and real-time-ish behavior for a demo/prototype environment.

Primary goals:

- Demonstrate a full order → bill cycle
- Provide role-based UI/UX for Admin / Waiter / Kitchen / Cashier
- Offer a lightweight QR ordering experience for customers
- Support a surplus flash-sale flow to reduce food waste

Audience: Intern/demo teams, small restaurants, instructors.

---

## Key Features ✅

- Table & reservation management with conflict checks
- Role-based access (Admin / Waiter / Kitchen / Cashier)
- Menu + categories, images, allergen tags
- Order creation, modification, split billing support
- Kitchen Display System (KDS) with event logging (KdsEvent)
- Billing with taxes, service charge, discounts and PDF invoice generation
- Per-table QR ordering (no payment gateway) with live polling for status
- Surplus/flash-sale mechanism (time-based discounts for selected items)
- Audit logs, refresh tokens, soft deletes and denormalized snapshots for reliability

---

## Architecture & Tech Stack 🧱

**Backend**

- Node.js (Express/Nest/your choice) — RESTful JSON API
- Prisma ORM + PostgreSQL
- Authentication: JWT access tokens + Refresh tokens
- Optional: Socket.IO for real-time where feasible

**Frontend (web)**

- React (Vite/CRA) — role-based dashboards
- Tailwind CSS (recommended) for quick layout

**Mobile**

- Flutter (cross-platform demo APK)

**Dev / Tooling**

- Git (branching: `main`, feature branches)
- Jest (unit tests), Cypress or Selenium (E2E)
- Docker / docker-compose for local DB
- jsPDF or Puppeteer for PDF invoice generation

---

## Repository Layout (recommended)

```
/ (root)
├─ backend/              # Node.js + Prisma + API server
│  ├─ prisma/            # schema.prisma, migrations, seed.ts
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ routes/
│  │  ├─ middlewares/
│  │  └─ index.ts
│  ├─ package.json
│  └─ README.md (backend specific)
├─ frontend/             # React app (admin/waiter/kitchen UI)
│  ├─ src/
│  ├─ public/
│  └─ package.json
├─ mobile/               # Flutter
│  ├─ lib/
│  └─ pubspec.yaml
├─ infra/                # docker-compose, manifests, deploy scripts
├─ docs/                 # API specs, ER diagrams, screenshots
└─ README.md             # This file
```

> Keep the backend and frontend separate to allow independent deployments later.

---

## Getting started (local development)

### Prerequisites

- Node.js >= 18
- npm / yarn
- PostgreSQL >= 12 (or use Docker)
- pnpm (optional)
- Flutter (for mobile dev)
- Docker & docker-compose (recommended for local DB)

### Environment variables (.env)

Create a `.env` file in `backend/` with the following keys (example):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rms_db?schema=public
JWT_SECRET=change_this_to_a_strong_value
JWT_REFRESH_SECRET=another_strong_value
PORT=4000
NODE_ENV=development
APP_BASE_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASS=""
```

> Never commit `.env` to the repo. Use `.env.example` with redacted values.

### Database & Prisma

The repository uses `prisma/schema.prisma` as the canonical DB schema. Example workflows:

1. Install dependencies

```bash
cd backend
npm install
# or: pnpm install
```

2. Create DB (docker-compose example)

```bash
# from repo root (if infra/docker-compose.yml exists)
docker-compose up -d postgres
# or create a local DB manually
```

3. Run Prisma migrations

```bash
npx prisma migrate dev --name init
# or (production): npx prisma migrate deploy
```

4. Generate Prisma client

```bash
npx prisma generate
```

5. Seed demo data (if seed script provided)

```bash
npm run seed
# or: node prisma/seed.js (depending on setup)
```

**Notes:**

- Use `prisma studio` to inspect DB: `npx prisma studio`.
- Use soft deletes (deletedAt) — include queries that filter them out by default in services.

### Run backend

```bash
cd backend
npm run dev
# typical scripts: dev, build, start
```

Typical `package.json` scripts to add to `backend/package.json`:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "prisma migrate dev",
    "generate": "prisma generate",
    "studio": "prisma studio",
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Run frontend

```bash
cd frontend
npm install
npm run dev
# open http://localhost:3000 (or the printed dev URL)
```

Frontend scripts: `dev`, `build`, `preview`, `lint`.

### Run mobile (Flutter)

```bash
cd mobile
flutter pub get
flutter run  # or open in your IDE
```

> For quick QA you can use an Android emulator or install the generated APK on a device.

---

## Scripts & Commands (cheat-sheet)

- `docker-compose up -d` — start local infra (Postgres)
- `cd backend && npm run dev` — start backend
- `cd frontend && npm run dev` — start web UI
- `cd mobile && flutter run` — start mobile app
- `cd backend && npx prisma migrate dev --name <desc>` — run migrations
- `cd backend && npx prisma studio` — DB browser

---

## Testing

- Unit tests: backend & frontend use Jest. Example:

  ```bash
  cd backend
  npm test
  ```

- E2E: Cypress or Selenium for flow tests (order → bill).

Aim for a base test coverage (e.g. 60–80%) for core services during the internship; more is better.

---

## API & Contracts (summary)

Provide a lightweight OpenAPI spec (YAML/JSON) in `/docs/openapi.yaml` covering key endpoints.

Important endpoints (examples):

- `POST /auth/login` — user login
- `POST /auth/refresh` — refresh token
- `GET /tables` — list tables
- `POST /tables/:id/assign` — assign waiter
- `POST /reservations` — create reservation
- `GET /menu` — public menu (used by QR)
- `POST /orders` — create order
- `PATCH /orders/:id/status` — update status (KDS)
- `POST /bills` — generate bill

**Versioning:** include `/v1/` prefix in early stages to simplify future versioned changes.

> Keep JSON contracts strict. Include schemas for `OrderItem`, `MenuItem`, `Bill` etc.

---

## Deployment

**Options**

- `Vercel` or `Netlify` for frontend
- `Render` or `Heroku` or `Fly` for backend (or container registry + Kubernetes for advanced teams)
- Managed Postgres (e.g. Render Postgres, AWS RDS) for production

**Docker**
Provide a `Dockerfile` for backend and a `docker-compose.yml` that contains:

- postgres
- pgadmin (optional)
- backend (built image)

**CI/CD** (recommended)

- GitHub Actions pipeline:
  - Lint → Test → Build → Migrate (for staging) → Deploy

**Migration strategy**

- `prisma migrate deploy` for prod
- Maintain migration history in the repo

---

## Operational notes (DB, backups, pruning)

- Schedule daily DB backups for production (snapshot + retention 30 days)
- Regularly prune old `AuditLog` / `KdsEvent` entries older than X months to keep DB size manageable
- Rotate JWT_SECRET and refresh tokens periodically
- Keep `pdfUrl` storage in durable object storage (S3 / GCS) if you generate invoices

---

## Security & Privacy 🔒

- Store passwords hashed with bcrypt (or argon2). Never store plaintext.
- Limit refresh token lifetime and support revocation via `RefreshToken.revoked`.
- Validate and sanitize all inputs (avoid SQL injection — Prisma helps, but validate business rules too).
- Use HTTPS in production; set `Secure` and `HttpOnly` on cookies where applicable.
- Role-based authorization checks on every protected route.
- Minimal PCI scope: do not store card details. For demo, treat card as a label only.

Privacy: only collect phone/email when needed and have an opt-in for marketing communications (even in demos).

---

## Contributing & Workflow 🤝

**Branching model**

- `main` — stable demo-ready code
- `develop` — integration branch (optional)
- `feature/*` — feature branches
- `hotfix/*` — urgent fixes

**PR checklist**

- Code compiles and tests pass
- Linting OK
- Migration included if DB schema changed (add a small summary in PR)
- Add/Update docs in `/docs`

**Commit messages**

- Use conventional commits (e.g., `feat: add reservation conflict check`, `fix: handle null imageUrl`) to enable changelog automation later.

---

## Roadmap & Extensions 🚀

- Payment gateway integration (Stripe/PayPal) — out-of-scope for MVP
- Multi-tenant support (tenant isolation per schema or row-level security)
- Reporting & analytics (sales, waste reduction metrics)
- Offline-first mobile ordering (local queue + sync)
- POS hardware integration (cash drawer, printers)

---

## Troubleshooting & FAQs

**Q: Prisma client fails at runtime**
A: Run `npx prisma generate` and ensure `DATABASE_URL` is valid.

**Q: Images not showing in frontend**
A: Check `imageUrl` fields. If using local uploads, ensure static file serving is set up and file paths are correct.

**Q: Reservations conflict**
A: Check timezone handling; store and compare in UTC.

## Contact / Maintainers

- Primary contact: _Aayus Karki_
- Email: `karki.aayush2003@gmail.com`

## License

MIT © 2025 AAYUS KARKI ([GitHub](https://github.com/aayus-karki))

---
