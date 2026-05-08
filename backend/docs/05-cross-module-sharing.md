# 05 — Cross-Module Sharing

> **Goal:** Understand how NestJS modules share functionality with each other — specifically how `exports`, `imports`, and `TypeOrmModule.forFeature()` work together.

---

## The Core Problem

In NestJS, **every module is isolated by default.** If `AuthModule` registers `JwtStrategy` as a provider, `TodoModule` cannot use it unless `AuthModule` explicitly **exports** it and `TodoModule` explicitly **imports** `AuthModule`.

This is by design — it prevents accidental coupling and keeps modules self-contained.

---

## The Three Ways Modules Share Things

### 1. `exports` + `imports` — Sharing Providers Between Modules

```
AuthModule
  providers: [AuthService, JwtStrategy]
  exports:   [JwtStrategy, PassportModule]   ← makes these available to importers
                    │
                    ▼
TodoModule
  imports:   [AuthModule]                    ← gets access to exported items
```

**In code:**

```typescript
// auth/auth.module.ts
@Module({
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],   // ← export what others need
})
export class AuthModule {}

// todo/todo.module.ts
@Module({
  imports: [AuthModule],   // ← import the entire module
  // Now JwtStrategy and PassportModule are available here
  // This allows JwtAuthGuard to work inside TodoController
})
export class TodoModule {}
```

**Rule of thumb:**
- If Module A's provider is **used by** Module B → Module A must `export` it, Module B must `import` Module A
- If a provider is only used internally → don't export it

---

### 2. `TypeOrmModule.forRoot()` vs `TypeOrmModule.forFeature()`

This is one of the most confusing parts for newcomers. Here's the distinction:

| Method | Used In | Purpose |
|--------|---------|---------|
| `TypeOrmModule.forRoot({...})` | `AppModule` (root, once) | Establishes the DB connection |
| `TypeOrmModule.forFeature([Entity])` | Feature modules | Registers entities for that module |

```typescript
// app.module.ts — configure the DB connection ONCE
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      database: 'crud_demo',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

```typescript
// todo/todo.module.ts — register Todo entity for use in this module
@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    // ↑ This makes Repository<Todo> injectable in TodoService
  ],
})
export class TodoModule {}
```

```typescript
// todo/todo.service.ts — inject the repository
@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)          // ← works because forFeature([Todo]) was called
    private readonly todoRepository: Repository<Todo>,
  ) {}
}
```

**What happens without `forFeature`?**  
NestJS throws:  
```
Nest can't resolve dependencies of the TodoService.
Please make sure that the "TodoRepository" token is available in the current module context.
```

---

### 3. `autoLoadEntities: true` in `forRoot()`

In `AppModule`, we set `autoLoadEntities: true`:

```typescript
TypeOrmModule.forRoot({
  ...
  autoLoadEntities: true,
  // ↑ Automatically picks up all entities registered via forFeature()
  //   across ALL modules. No need to list entities manually here.
})
```

Without this, you'd have to manually list every entity:
```typescript
TypeOrmModule.forRoot({
  entities: [User, Todo],   // ← tedious to maintain as your app grows
})
```

With `autoLoadEntities: true`, TypeORM discovers entities automatically from `forFeature()` registrations.

---

## The Full Dependency Graph of Our Project

```
AppModule (root)
│
├── imports TypeOrmModule.forRoot()    ← DB connection
│
├── imports AuthModule
│     │
│     ├── imports PassportModule
│     ├── imports JwtModule
│     ├── imports TypeOrmModule.forFeature([User])  ← can use Repository<User>
│     │
│     ├── providers: [AuthService, JwtStrategy]
│     ├── controllers: [AuthController]
│     │
│     └── exports: [JwtStrategy, PassportModule]    ← shared with TodoModule
│
└── imports TodoModule
      │
      ├── imports TypeOrmModule.forFeature([Todo])  ← can use Repository<Todo>
      │
      ├── imports AuthModule                         ← gets JwtStrategy + PassportModule
      │     (which enables JwtAuthGuard to work)
      │
      ├── providers: [TodoService]
      └── controllers: [TodoController]
```

---

## Why `JwtStrategy` Is Exported (Not `JwtService` or `AuthService`)

A common question: "Why does `AuthModule` export `JwtStrategy` and `PassportModule` instead of `JwtAuthGuard`?"

Because `JwtAuthGuard` extends `AuthGuard('jwt')`, which internally asks Passport: "Do you have a strategy named 'jwt'?" Passport finds it via `JwtStrategy`, which must be registered in the consuming module's context.

```typescript
// jwt-auth.guard.ts
export class JwtAuthGuard extends AuthGuard('jwt') {}
//                                          ↑
// Passport looks for a registered strategy named 'jwt'
// JwtStrategy registers itself as 'jwt' via PassportStrategy(Strategy)
// If JwtStrategy is not in scope → error!
```

So to make `JwtAuthGuard` work inside `TodoModule`:
1. `AuthModule` exports `JwtStrategy` (the 'jwt' strategy) and `PassportModule`
2. `TodoModule` imports `AuthModule` → gets both
3. Now `JwtAuthGuard` can find the 'jwt' strategy → works correctly ✅

---

## Cross-Module Entity Access

`User` entity is defined in `user/entities/user.entity.ts`. Both `AuthModule` and `JwtStrategy` need it. Here's how they access it:

```typescript
// auth/auth.module.ts
TypeOrmModule.forFeature([User])   // ← registered for auth module

// auth/auth.service.ts
@InjectRepository(User)
private userRepository: Repository<User>   // ← injected here ✅

// auth/jwt.strategy.ts
@InjectRepository(User)
private userRepository: Repository<User>   // ← also injected here ✅
```

Both work because they're in `AuthModule`'s context, which registered the `User` entity via `forFeature([User])`.

---

## What If You Forget to Import a Module?

Here are the exact errors you'll see and what they mean:

### Error 1: Forgetting `AuthModule` in `TodoModule`

```
Nest can't resolve dependencies of the JwtAuthGuard (?).
Please make sure that the argument "jwt" in JwtAuthGuard is available
in the TodoModule context.
```

**Fix:** Add `AuthModule` to `TodoModule`'s `imports`.

---

### Error 2: Forgetting `TypeOrmModule.forFeature([Todo])`

```
Nest can't resolve dependencies of the TodoService (?).
Please make sure that the "TodoRepository" token is available
in the TodoModule context.
```

**Fix:** Add `TypeOrmModule.forFeature([Todo])` to `TodoModule`'s `imports`.

---

### Error 3: Forgetting `@Injectable()` on a service

```
Nest can't resolve dependencies of TodoController.
Please make sure that TodoService is available in TodoModule context.
```

**Fix:** Add `@Injectable()` decorator to `TodoService` and add it to `providers`.

---

## Summary Table — What Goes Where

| Concept | Where to Define | Where to Register | Where to Use |
|---------|----------------|-------------------|--------------|
| Service | `*.service.ts` with `@Injectable()` | `providers: []` in its module | Inject via constructor |
| Controller | `*.controller.ts` with `@Controller()` | `controllers: []` in its module | NestJS auto-routes |
| Entity | `*.entity.ts` with `@Entity()` | `forFeature([Entity])` in its module | Inject `Repository<Entity>` |
| Guard | `*.guard.ts` | `providers: []` OR used directly | `@UseGuards(Guard)` |
| Strategy | `*.strategy.ts` with `@Injectable()` | `providers: []` in its module | Used by Guard internally |
| Shared provider | Any module | `exports: []` in source module | `imports: [SourceModule]` in consumer |

---

## Quick Reference: Adding a New Feature Module

When you add a new feature (e.g., a `comments` feature), follow this checklist:

```
1. Create comments/comments.module.ts
   - imports: [TypeOrmModule.forFeature([Comment])]
   - Add AuthModule if routes need to be protected
   - controllers: [CommentsController]
   - providers: [CommentsService]

2. Create comments/entities/comment.entity.ts
   - @Entity('comments')
   - Define all columns

3. Create comments/comments.service.ts
   - @Injectable()
   - constructor(@InjectRepository(Comment) private repo: Repository<Comment>)

4. Create comments/comments.controller.ts
   - @Controller('comments')
   - @UseGuards(JwtAuthGuard)

5. Register in AppModule:
   - Add CommentsModule to AppModule.imports[]
```

---

**You've reached the end of the docs!** 🎉

Go back to [README.md](../README.md) for the quick-start guide, or explore the source files — they're all heavily commented to reinforce what you've learned here.
