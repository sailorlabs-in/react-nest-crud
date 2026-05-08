# React Todo App - Frontend

A beginner-friendly React + TypeScript frontend for the NestJS Todo API. This app lets users register, log in, manage todos, and stay authenticated with a JWT stored in `localStorage`.

The code is intentionally split into small files:

- `api/` contains every HTTP request.
- `components/` contains reusable UI pieces.
- `types/` contains shared TypeScript shapes.
- `App.tsx` connects everything together.

## Documentation Index

Read these files in order if you are new to React:

| # | File | What You Will Learn |
|---|------|---------------------|
| 1 | [React Core Concepts](./docs/01-react-core-concepts.md) | Components, JSX, props, state, effects |
| 2 | [File & Folder Structure](./docs/02-file-structure.md) | What each frontend folder does |
| 3 | [API Layer](./docs/03-api-layer.md) | Axios setup, auth token handling, API functions |
| 4 | [Components & State Flow](./docs/04-components-state-flow.md) | How UI components talk to `App.tsx` |
| 5 | [Auth & Todo Flow](./docs/05-auth-todo-flow.md) | Login, profile loading, CRUD flow |
| 6 | [Environment Variables](./docs/06-environment-variables.md) | Vite env variables and frontend config |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React | Builds the user interface from components |
| TypeScript | Adds type safety to React code |
| Vite | Runs the dev server and builds the frontend |
| Axios | Sends HTTP requests to the NestJS backend |
| CSS | Styles the app |

## Quick Start

### 1. Start the backend first

The frontend expects the backend API at:

```bash
http://localhost:5000/api
```

From the backend folder:

```bash
cd ../backend
npm install
npm run start:dev
```

### 2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

If npm has cache permission issues on your machine, use a local cache:

```bash
npm install --cache ./.npm-cache
```

### 3. Configure environment variables

Copy the safe template:

```bash
cp .env.example .env
```

The default local value is:

```bash
VITE_API_URL=http://localhost:5000/api
```

Only variables that start with `VITE_` are exposed to frontend code.

### 4. Start the frontend

```bash
npm run dev
```

Vite will print a local URL, usually:

```bash
http://localhost:5001
```

### 5. Build for production

```bash
npm run build
```

This checks TypeScript and creates the production files in `dist/`.

## Project Structure

```text
frontend/
├── src/
│   ├── api/
│   │   ├── apiClient.ts       # Axios instance, token storage, error helper
│   │   ├── authApi.ts         # login, register, getProfile
│   │   └── todoApi.ts         # get, create, update, delete todos
│   │
│   ├── components/
│   │   ├── AppBackground.tsx  # Shared page background wrapper
│   │   ├── AuthForm.tsx       # Login/register form
│   │   ├── EmptyState.tsx     # Loading and empty todo UI
│   │   ├── ErrorBanner.tsx    # Reusable error message
│   │   ├── TodoForm.tsx       # Create todo form
│   │   ├── TodoHeader.tsx     # User greeting, stats, logout
│   │   ├── TodoItem.tsx       # One todo card, edit/delete/toggle
│   │   └── TodoList.tsx       # Renders all todos
│   │
│   ├── types/
│   │   └── index.ts           # Todo, User, request/response types
│   │
│   ├── App.tsx                # Main state and event handlers
│   ├── App.css                # App styles
│   ├── index.css              # Global root styles
│   └── main.tsx               # React entry point
│
├── docs/                      # Beginner guide
├── .env.example               # Safe env template (no real secrets)
├── index.html                 # Vite HTML shell
├── vite.config.ts             # Vite config
└── package.json               # Scripts and dependencies
```

## API Calls

All API calls are separated from components.

```typescript
// src/api/todoApi.ts
export async function getTodos() {
  const response = await apiClient.get<Todo[]>('/todos');
  return response.data;
}
```

Components do not know the backend URL. They only receive handler functions from `App.tsx`.

The backend URL comes from `VITE_API_URL`:

```typescript
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
```

## Authentication Summary

1. User submits `AuthForm`.
2. `App.tsx` calls `login()` or `register()` from `authApi.ts`.
3. Backend returns `{ accessToken, user }`.
4. Token is saved in `localStorage`.
5. Axios automatically adds `Authorization: Bearer <token>` to future requests.
6. Todo requests now work because the backend can identify the logged-in user.

## Useful Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Type-checks and builds production files |
| `npm run lint` | Runs ESLint |
| `npm run preview` | Serves the production build locally |

## Where to Start Reading

New to React? Start here:

[React Core Concepts](./docs/01-react-core-concepts.md)

New to frontend env variables? Read:

[Environment Variables](./docs/06-environment-variables.md)
