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

### 🔐 Authentication & Authorization

* JWT access & refresh tokens
* Role‑based access control (Admin, Cashier, Waiter, Kitchen)
* Secure password hashing

### 🍽 Menu & Restaurant Operations

* Menu categories & items CRUD
* Table & reservation management
* QR‑based customer ordering flow
* Order, order-items, and status tracking (PENDING → PREPARING → SERVED)
* Kitchen Display System (KDS) events & history
* Billing, discounts, and invoice generation
* Surplus (flash‑sale) item posting

### 🛠 System

* Audit logging
* Multi-branch support
* Scalable API architecture
* PostgreSQL relational schema via Prisma ORM

---

## 🧠 Tech Stack

* **Node.js** (Runtime)
* **Express.js** (HTTP server)
* **TypeScript** (Static typing)
* **Prisma ORM** (Database client)
* **PostgreSQL** (Database)
* **Socket.IO** (Real‑time updates; optional)
* **Jest** (Testing)

---

## 📁 Project Structure

```plaintext
/backend
├─ prisma/
│  ├─ migrations/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ routes/
│  ├─ services/
│  ├─ utils/
│  └─ index.ts
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ README.md
```

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
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restaurantqrify
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=4000
NODE_ENV=development
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

---

## 🧪 Testing

Run unit tests:

```bash
npm test
```

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

* Render / Railway / Fly.io
* PostgreSQL cloud instance
* CI/CD with GitHub Actions

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
