# 03 — Auth Module Deep Dive

> **Goal:** Understand exactly how JWT authentication works in NestJS — from registering a user to protecting a route to extracting the user in a controller.

---

## The Big Picture

```
┌──────────────┐     POST /api/auth/register    ┌──────────────┐
│    Client    │ ──────────────────────────────► │AuthController│
│  (React App) │                                 └──────┬───────┘
│              │ ◄── { accessToken, user } ──────       │ calls
│              │                                  ┌──────▼───────┐
│              │                                  │ AuthService  │
│              │                                  │ 1. check dup │
│              │                                  │ 2. bcrypt()  │
│              │                                  │ 3. save user │
│              │                                  │ 4. sign JWT  │
│              │                                  └──────────────┘
│              │
│              │     GET /api/todos               ┌──────────────┐
│              │     Authorization: Bearer <JWT>  │ JwtAuthGuard │
│              │ ──────────────────────────────►  │ (validates)  │
│              │                                  └──────┬───────┘
│              │                                         │ valid?
│              │                                  ┌──────▼───────┐
│              │                                  │ JwtStrategy  │
│              │                                  │ .validate()  │
│              │                                  │ → req.user   │
│              │                                  └──────┬───────┘
│              │                                         │
│              │                                  ┌──────▼───────┐
│              │ ◄── [ array of todos ] ────────  │TodoController│
└──────────────┘                                  └──────────────┘
```

---

## What is a JWT?

A **JSON Web Token (JWT)** is a compact, URL-safe string used to securely transmit information.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9    ← Header (algorithm)
.
eyJzdWIiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSJ9  ← Payload (your data)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c       ← Signature (tamper-proof)
```

The payload decodes to:
```json
{ "sub": 1, "email": "john@example.com", "iat": 1234567890, "exp": 1234654290 }
```

- `sub` — "subject" (the user's ID) — JWT standard claim
- `iat` — "issued at" timestamp
- `exp` — "expires at" timestamp

> **Important:** JWTs are **not encrypted** — anyone can base64-decode the payload. Never put sensitive data (passwords, credit cards) in a JWT. They are only **signed** — meaning you can verify they haven't been tampered with.

---

## Registration Flow — Step by Step

### `POST /api/auth/register`

```
Request body: { name: "John", email: "john@example.com", password: "secret123" }
```

**Step 1 — ValidationPipe** (global, set up in `main.ts`)
- Checks the body against `RegisterDto`
- If `email` is not a valid email → returns `400 Bad Request` immediately
- If `password` is less than 6 chars → returns `400`

**Step 2 — `AuthController.register()`**
```typescript
@Post('register')
register(@Body() registerDto: RegisterDto) {
  return this.authService.register(registerDto);
  // just passes the validated data straight to the service
}
```

**Step 3 — `AuthService.register()`**
```typescript
async register(registerDto: RegisterDto) {
  // 1. Check for duplicate email
  const existingUser = await this.userRepository.findOneBy({ email });
  if (existingUser) throw new ConflictException('Email is already registered');
  //                        ↑ returns HTTP 409 Conflict

  // 2. Hash the password (NEVER store plain-text passwords)
  const hashedPassword = await bcrypt.hash(password, 10);
  // 10 = salt rounds. Higher = more secure but slower.
  // bcrypt generates something like: "$2b$10$X9k3uV..."

  // 3. Save to database
  const user = this.userRepository.create({ name, email, password: hashedPassword });
  await this.userRepository.save(user);

  // 4. Generate JWT
  const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });

  // 5. Return (never send the password back!)
  return { accessToken, user: { id: user.id, name, email } };
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": { "id": 1, "name": "John", "email": "john@example.com" }
}
```

---

## Login Flow — Step by Step

### `POST /api/auth/login`

**Step 3 — `AuthService.login()`**
```typescript
async login(loginDto: LoginDto) {
  // Find user — NOTE: we must explicitly SELECT password
  // because `select: false` hides it by default (security feature)
  const user = await this.userRepository
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .addSelect('user.password')  // ← explicit opt-in
    .getOne();

  if (!user) throw new UnauthorizedException('Invalid email or password');
  // ↑ same generic message for both "user not found" and "wrong password"
  // This prevents attackers from discovering which emails are registered

  // Compare plain-text password against stored hash
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new UnauthorizedException('Invalid email or password');

  // Generate and return JWT
  const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
  return { accessToken, user: { id: user.id, name: user.name, email: user.email } };
}
```

---

## The JWT Strategy — How Protected Routes Work

The `JwtStrategy` is the Passport strategy that runs on every request to a protected route.

### File: `auth/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ↑ looks for: "Authorization: Bearer <token>" in request headers

      ignoreExpiration: false,
      // ↑ expired tokens are rejected (false = don't ignore expiration)

      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      // ↑ same secret used to sign tokens — loaded from .env
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // payload = decoded token: { sub: 1, email: "john@example.com" }
    // This method is called ONLY if the signature verified successfully

    const user = await this.userRepo.findOneBy({ id: payload.sub });
    if (!user) throw new UnauthorizedException('User no longer exists');

    return user;
    // ↑ Whatever you return here gets attached to request.user
  }
}
```

### The Full Token Validation Flow

```
Request: GET /api/todos
Headers: { Authorization: "Bearer eyJhbGc..." }
         │
         ▼
JwtAuthGuard.canActivate()
         │
         ▼
ExtractJwt.fromAuthHeaderAsBearerToken()
→ extracts: "eyJhbGc..."
         │
         ▼
Verify signature using secretOrKey
→ If tampered: throw 401
→ If expired: throw 401
→ If valid: decode payload
         │
         ▼
JwtStrategy.validate({ sub: 1, email: "john@example.com" })
→ Look up user in DB by id=1
→ return user object
         │
         ▼
request.user = { id: 1, name: "John", email: "...", ... }
         │
         ▼
Route handler executes ✅
```

---

## The Guard — Protecting Routes

### File: `auth/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

That's literally all the code. It inherits everything from NestJS/Passport's built-in `AuthGuard('jwt')`, which internally uses the `JwtStrategy` registered in the module.

### How to Use It

**On a single route:**
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)   // ← only this route is protected
getProfile() { ... }
```

**On an entire controller** (all routes protected):
```typescript
@UseGuards(JwtAuthGuard)   // ← applies to ALL routes below
@Controller('todos')
export class TodoController { ... }
```

**When the guard fails:**
```json
HTTP 401 Unauthorized
{ "statusCode": 401, "message": "Unauthorized" }
```

---

## The Custom Decorator — `@GetUser()`

### File: `auth/decorators/get-user.decorator.ts`

After the guard validates the token, the user is on `request.user`. This custom decorator extracts it cleanly and with type safety.

```typescript
export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Before vs. After

```typescript
// Without @GetUser() — raw and not type-safe:
@Get()
findAll(@Req() req: Request) {
  const user = req.user as User;
  return this.todoService.findAll(user.id);
}

// With @GetUser() — clean and fully typed:
@Get()
findAll(@GetUser() user: User) {
  return this.todoService.findAll(user.id);
}
```

---

## Module Wiring — Why `exports` Matters

The `AuthModule` exports `JwtStrategy` and `PassportModule`:

```typescript
// auth/auth.module.ts
@Module({
  ...
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

And `TodoModule` imports `AuthModule`:

```typescript
// todo/todo.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    AuthModule,   // ← this gives TodoController access to JwtAuthGuard
  ],
  ...
})
export class TodoModule {}
```

**Without this import**, NestJS would throw an error:
```
Nest can't resolve dependencies of JwtAuthGuard.
Please make sure that the "jwt" strategy is available in current context.
```

See [Cross-Module Sharing →](./05-cross-module-sharing.md) for a full explanation.

---

## Security Best Practices Used in This Project

| Practice | Where | Why |
|----------|-------|-----|
| `bcrypt.hash(password, 10)` | `auth.service.ts` | Never store plain-text passwords |
| `select: false` on password column | `user.entity.ts` | Never accidentally expose password hash |
| `addSelect('user.password')` only in login | `auth.service.ts` | Opt-in password exposure — only when needed |
| Generic "Invalid email or password" message | `auth.service.ts` | Don't reveal which emails are registered |
| JWT expiration `24h` | `auth.module.ts` | Tokens auto-expire for security |
| Secret in env vars (in production) | `auth.module.ts`, `jwt.strategy.ts` | Never hardcode secrets in production |

---

**Next:** [Todo Module Deep Dive →](./04-todo-module.md)
