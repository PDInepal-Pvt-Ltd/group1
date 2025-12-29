# 🚀 RestaurantQRify — Backend Service

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

<p align="center"><b>Production-grade backend powering the RestaurantQRify ecosystem.</b></p>

This is the **backend API** for **RestaurantQRify**, a modern Restaurant Management System (RMS) providing QR‑based customer ordering, real‑time kitchen display, billing, table management, reservations, surplus flash‑sale items, and more.

Backend is built with **Node.js + Express + Prisma + PostgreSQL**, providing secure, scalable REST APIs for web and mobile clients.

---

## ⭐ Features (Backend)

### 🛡️ Security & Access Control

- **Advanced JWT Authentication:** Access & refresh tokens with Role-Based Access Control (RBAC).
- **Token Blacklisting:** JTI-based immediate revocation of Access Tokens upon logout (via Redis).
- **Brute-Force Protection:** Specialized rate limiting on critical routes (login, signup, refresh).
- **Session Security:** IP/User Agent change detection on refresh token usage to prevent session hijacking.
- **Audit Logging:** Asynchronously logs all authentication events (login success/failure, session refresh, account creation) using a dedicated Queue.

### 🍽 Menu & Core Operations

- Menu categories & items CRUD.
- Table, reservation, and multi-branch management.
- QR‑based customer ordering flow and status tracking (PENDING → PREPARING → SERVED).
- Kitchen Display System (KDS) real-time events.
- Billing, discount calculation, and invoice generation.
- Surplus (flash‑sale) item posting.

### 🛠 System Architecture

- Robust global error handling and API-wide request validation.
- Background job processing via **BullMQ** (for audit logs).
- **Husky** pre-commit hooks for enforced Conventional Commits.
- Structured logging via Winston.
- OpenAPI documentation generation.

---

## 🧠 Tech Stack

- **Node.js** (Runtime)
- **Express.js** (HTTP server)
- **TypeScript** (Static typing)
- **Prisma ORM** (Database client)
- **PostgreSQL** (Database)
- **Redis** (Caching/Blacklisting/Queue Broker)
- **BullMQ** (Job Queue)
- **Socket.IO** (Real‑time updates; optional)
- **Husky** (Git Hooks)
- **tsx** (TypeScript Execution)
- **Winston** (Logging)

---

## 📁 Project Structure

````plaintext
```plaintext
/backend
├─ .husky/
├─ logs/
├─ prisma.config.ts
├─ commitlint.config.js
├─ src/
│  ├─ api/             # Grouped feature modules (e.g., /user, /auditlog)
│  │  ├─ user/         # (Controller, Service, Repository, Router, Model)
│  │  └─ auditlog/
│  ├─ common/          # Shared components (Middleware, Utils, Redis client)
│  ├─ api-docs/        # OpenAPI spec generation logic
│  ├─ generated/       # Code generated from schemas (optional)
│  ├─ prisma/          # Global Prisma client
│  ├─ queues/          # BullMQ queue definitions and workers
│  ├─ server.ts        # Express app configuration
│  └─ index.ts         # Server entry point
├─ package.json
└─ .env.example
````

---

## 🛠 Setup & Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/AAYUSKARKI/RestaurantQRify.git
cd RestaurantQRify/backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create `.env` file from `.env.example`:

```plaintext
DATABASE_URL="your-database-url"
ACCESS_TOKEN_SECRET="your-secret-key"
REFRESH_TOKEN_SECRET="your-secret-key"
PORT="your server port number"
NODE_ENV="development or production"

# Redis (for Caching, Blacklisting, and BullMQ)
REDIS_USERNAME="your redis username"
REDIS_PASSWORD="your redis password"
REDIS_HOST="your redis host"
REDIS_PORT="your redis port number"

# Rate Limiting Configuration
COMMON_RATE_LIMIT_WINDOW_MS="1000"
COMMON_RATE_LIMIT_MAX_REQUESTS="20"
AUTH_RATE_LIMIT_MAX_REQUESTS="5"
AUTH_RATE_LIMIT_WINDOW_MS="60000"
```

> **⚠ Do not commit real credentials.**

### 4️⃣ Prisma Setup

```bash
npx prisma migrate dev --name init\_nnpx prisma generate
```

### 5️⃣ Run the Server

```bash
npm run dev
```

Server will start at:

```
http://localhost:4000
```

---

## 📡 API Overview (Top-Level)

### 🔐 Auth

| Method | Endpoint        | Description   |
| ------ | --------------- | ------------- |
| POST   | `/auth/login`   | Login user    |
| POST   | `/auth/refresh` | Refresh token |

### 🍽 Tables

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/tables`            | List tables         |
| PATCH  | `/tables/:id/status` | Update table status |

### 🛒 Orders

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/orders`            | Create order      |
| GET    | `/orders/:id`        | Get order details |
| PATCH  | `/orders/:id/status` | Update status     |

### 👨‍🍳 KDS

| Method | Endpoint     | Description         |
| ------ | ------------ | ------------------- |
| GET    | `/kds`       | View pending orders |
| POST   | `/kds/event` | Push event          |

### 💵 Billing

| Method | Endpoint     | Description  |
| ------ | ------------ | ------------ |
| POST   | `/bills`     | Create bill  |
| GET    | `/bills/:id` | View invoice |

---

## 📦 Scripts

```json
{
  "scripts": {
    "dev": "node --import=tsx --env-file=.env --watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "migrate": "prisma migrate dev",
    "generate": "prisma generate",
    "studio": "prisma studio",
    "seed": "ts-node prisma/seed.ts",
    "changelog": "npx git-cliff -c .cliff.toml > CHANGELOG.md",
    "prepare": "husky",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## 🧪 Testing

Note: Testing framework setup is pending.

---

## 🐳 Docker Support (Optional)

### Dockerfile

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

---

## 🌐 Deployment

- Render / Railway / Fly.io
- PostgreSQL cloud instance
- CI/CD with GitHub Actions

---

## 🤝 Contributing

1. Fork repo
2. Create feature branch
3. Commit changes
4. Submit PR

Follow clean code, proper naming, and commit standards.

---

## 📞 Maintainer

**Aayus Karki**

---

## 📜 License

MIT License © 2025
