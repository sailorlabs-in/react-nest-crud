# 06 - Environment Variables

Goal: understand how the React frontend reads runtime-like config safely with Vite.

## Why Use Env Variables?

The frontend needs to know where the backend API lives.

Bad:

```typescript
const API_URL = 'http://localhost:5000/api';
```

Better:

```typescript
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
```

Now the URL can change between local development and production without editing source code.

## Files

```text
frontend/
├── .env.example   # Safe template committed to git
└── .env           # Local values, ignored by git
```

Create your local file:

```bash
cp .env.example .env
```

## Current Variables

| Variable | Used for |
|----------|----------|
| `VITE_API_URL` | Base URL for the NestJS API |

## Important Vite Rule

Vite only exposes variables that start with `VITE_` to frontend code.

This works:

```bash
VITE_API_URL=http://localhost:5000/api
```

This will not be available in React code:

```bash
API_URL=http://localhost:5000/api
```

## Are Frontend Env Variables Secret?

No. Anything used by React in the browser can be seen by users in built JavaScript.

Frontend env variables are good for public config like:

- API base URL
- public analytics ID
- feature flags

They are not safe for:

- database passwords
- JWT signing secrets
- private API keys

Real secrets belong on the backend.

## Best Practices

- Commit `.env.example`.
- Never commit `.env`.
- Prefix frontend variables with `VITE_`.
- Keep secrets only in backend env variables.
- Restart the Vite dev server after changing `.env`.
