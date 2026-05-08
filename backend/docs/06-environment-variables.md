# 06 - Environment Variables

Goal: understand how this backend keeps secrets and runtime config out of source code.

## Why Use Environment Variables?

Values like database passwords and JWT secrets should not be hardcoded in TypeScript files.

Bad:

```typescript
password: 'secret123'
```

Better:

```typescript
password: configService.getOrThrow<string>('DB_PASSWORD')
```

This keeps real secrets in `.env`, which is ignored by git.

## Files

```text
backend/
├── .env.example   # Safe template committed to git
└── .env           # Real local values, ignored by git
```

Create your local env file:

```bash
cp .env.example .env
```

Then edit `.env`.

## Current Variables

| Variable | Used for |
|----------|----------|
| `PORT` | Backend server port |
| `FRONTEND_URL` | Allowed CORS origin |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `DB_SYNC` | Auto-sync database tables in development |
| `DB_LOGGING` | Print SQL queries |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | JWT lifetime |

## How NestJS Loads Env Values

`AppModule` imports `ConfigModule`:

```typescript
ConfigModule.forRoot({
  isGlobal: true,
})
```

`isGlobal: true` means any module can inject `ConfigService`.

## Database Config

TypeORM is configured with `forRootAsync()` because it needs `ConfigService`.

```typescript
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
  }),
})
```

`getOrThrow()` is useful for required values. If a required env variable is missing, the app fails fast instead of connecting with bad config.

## JWT Config

The JWT secret is also loaded from env:

```typescript
secret: configService.getOrThrow<string>('JWT_SECRET')
```

The same `JWT_SECRET` is used in:

- `auth.module.ts` to sign tokens
- `jwt.strategy.ts` to verify tokens

These two must always match.

## Frontend URL and CORS

`main.ts` reads:

```typescript
origin: configService.get<string>('FRONTEND_URL', 'http://localhost:5001')
```

This tells the backend which frontend origin is allowed to call it from the browser.

## Best Practices

- Commit `.env.example`.
- Never commit `.env`.
- Use long random values for `JWT_SECRET`.
- Use different secrets for development, staging, and production.
- Keep `DB_SYNC=true` only for local development.
- Use migrations instead of `DB_SYNC=true` in production.
