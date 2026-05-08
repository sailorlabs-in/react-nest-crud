# 🚀 NestJS Todo API — Backend

A full-stack **Todo CRUD** application backend built with **NestJS**, **TypeORM**, and **PostgreSQL**. This project is intentionally designed as a **learning reference** — every file is heavily commented so a developer new to NestJS can understand what every line does and why.

---

## 📚 Documentation Index

This README gives you the big picture and quick-start steps.  
For deep-dives, read the docs in order:

| # | File | What You'll Learn |
|---|------|-------------------|
| 1 | [Core NestJS Concepts](./docs/01-nestjs-core-concepts.md) | Modules, Controllers, Services, Dependency Injection |
| 2 | [File & Folder Structure](./docs/02-file-structure.md) | What every file does and why it exists |
| 3 | [Auth Module Deep Dive](./docs/03-auth-module.md) | JWT, Guards, Strategies, Custom Decorators |
| 4 | [Todo Module Deep Dive](./docs/04-todo-module.md) | DTOs, Entities, TypeORM, User-Scoped CRUD |
| 5 | [Cross-Module Sharing](./docs/05-cross-module-sharing.md) | How modules export/import features from each other |
| 6 | [Environment Variables](./docs/06-environment-variables.md) | How secrets and runtime config are loaded safely |

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | ^11 | Backend framework |
| TypeScript | ^5.7 | Type safety |
| TypeORM | ^0.3 | ORM for database operations |
| PostgreSQL | any | Relational database |
| Passport + JWT | — | Authentication |
| bcrypt | ^6 | Password hashing |
| class-validator | ^0.15 | Request body validation |
| Swagger | ^11 | Auto-generated API docs |

---

## ⚡ Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL running locally
- A database named `crud_demo`

```sql
-- Run in psql or pgAdmin
CREATE DATABASE crud_demo;
CREATE USER your_database_user WITH PASSWORD 'your_database_password';
GRANT ALL PRIVILEGES ON DATABASE crud_demo TO your_database_user;
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Then edit `.env` with your local PostgreSQL username, password, database name, JWT secret, and frontend URL.

Never commit `.env`. Commit only `.env.example`.

### 4. Start the Server

```bash
npm run start:dev     # Development (watch mode — restarts on file changes)
npm run start:prod    # Production (runs compiled JS from dist/)
npm run build         # Compile TypeScript to dist/
```

Server starts on **http://localhost:5000**

### 5. Explore the API

Visit **http://localhost:5000/api/docs** for the interactive Swagger UI.

---

## 🗂️ Project Structure (Overview)

```
backend/
├── src/
│   ├── main.ts                    # Entry point — bootstraps the app
│   ├── app.module.ts              # Root module — ties everything together
│   ├── app.controller.ts          # Root controller (health check)
│   ├── app.service.ts             # Root service
│   │
│   ├── auth/                      # Authentication feature module
│   │   ├── auth.module.ts         # Module definition + JWT/Passport config
│   │   ├── auth.controller.ts     # POST /register, POST /login, GET /profile
│   │   ├── auth.service.ts        # Business logic: register, login, hash passwords
│   │   ├── jwt.strategy.ts        # Passport JWT strategy (validates tokens)
│   │   ├── dto/
│   │   │   ├── register.dto.ts    # Shape + validation for registration data
│   │   │   └── login.dto.ts       # Shape + validation for login data
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts  # Route protector (blocks unauthenticated requests)
│   │   └── decorators/
│   │       └── get-user.decorator.ts  # @GetUser() — extracts user from JWT
│   │
│   ├── todo/                      # Todo feature module
│   │   ├── todo.module.ts         # Module definition
│   │   ├── todo.controller.ts     # CRUD route handlers (all protected by JWT)
│   │   ├── todo.service.ts        # Business logic: user-scoped CRUD operations
│   │   ├── dto/
│   │   │   ├── create-todo.dto.ts # Shape + validation for creating todos
│   │   │   └── update-todo.dto.ts # Shape + validation for updating todos
│   │   └── entities/
│   │       └── todo.entity.ts     # Database table definition (todos)
│   │
│   └── user/
│       └── entities/
│           └── user.entity.ts     # Database table definition (users)
│
├── docs/                          # 📖 Learning documentation
│   ├── 01-nestjs-core-concepts.md
│   ├── 02-file-structure.md
│   ├── 03-auth-module.md
│   ├── 04-todo-module.md
│   └── 05-cross-module-sharing.md
│
├── nest-cli.json                  # NestJS CLI configuration
├── .env.example                   # Safe env template (no real secrets)
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

---

## 🔗 API Endpoints Summary

### Auth Routes (Public)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Register a new user, returns JWT token |
| `POST` | `/api/auth/login` | Login, returns JWT token |
| `GET` | `/api/auth/profile` | Get current user profile *(requires token)* |

### Todo Routes (Protected — JWT Required)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/todos` | Create a new todo |
| `GET` | `/api/todos` | Get all todos for the logged-in user |
| `GET` | `/api/todos/:id` | Get a single todo |
| `PATCH` | `/api/todos/:id` | Update a todo |
| `DELETE` | `/api/todos/:id` | Delete a todo |

> All `/api/todos` routes require the header:  
> `Authorization: Bearer <your_jwt_token>`

---

## 🔐 Authentication Flow

```
1. POST /api/auth/register  →  { name, email, password }
                            ←  { accessToken, user }

2. Use that token in future requests:
   GET /api/todos
   Headers: { Authorization: "Bearer eyJhbGciOi..." }

3. Server validates token → returns user's todos only
```

---

## 📖 Read the Docs

**New to NestJS?** Start with [Core NestJS Concepts →](./docs/01-nestjs-core-concepts.md)

**New to env config?** Read [Environment Variables →](./docs/06-environment-variables.md)
