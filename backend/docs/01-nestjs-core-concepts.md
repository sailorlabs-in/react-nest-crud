# 01 — NestJS Core Concepts

> **Goal of this document:** Understand the fundamental building blocks of NestJS before looking at any code. If you understand this page, the rest of the codebase will make sense.

---

## What is NestJS?

NestJS is a **backend framework for Node.js** built on top of Express. It uses TypeScript and brings structure to your server-side code using concepts borrowed from Angular:

- **Decorators** (`@Controller`, `@Injectable`, etc.) to annotate classes
- **Modules** to organize features
- **Dependency Injection** to wire things together automatically

Think of it as "Angular for the backend."

---

## The 4 Core Building Blocks

Every NestJS application is built from four things:

```
┌─────────────┐
│   Module    │  ← organizes everything (imports, exports, controllers, providers)
│  ┌────────┐ │
│  │Controller│ ← handles HTTP requests and responses
│  └────────┘ │
│  ┌────────┐ │
│  │ Service │ ← contains the actual business logic
│  └────────┘ │
│  ┌────────┐ │
│  │ Entity  │ ← maps to a database table (via TypeORM)
│  └────────┘ │
└─────────────┘
```

---

## 1. Module (`@Module`)

A **Module** is a container that groups related code together. Every NestJS app has a **root module** (`AppModule`) and can have many **feature modules** (`AuthModule`, `TodoModule`, etc.).

```typescript
@Module({
  imports: [],      // Other modules this module depends on
  controllers: [],  // Route handlers that belong to THIS module
  providers: [],    // Services (and other injectables) that belong to THIS module
  exports: [],      // What THIS module makes available to OTHER modules
})
export class SomeModule {}
```

### Analogy
Think of a Module like a **department in a company**:
- The HR Department (module) has HR staff (services) and an HR desk (controller)
- If another department needs HR functionality, they *import* the HR module

### In Our Project

```
AppModule (root — the whole company)
  ├── AuthModule  (authentication department)
  └── TodoModule  (todo management department)
```

---

## 2. Controller (`@Controller`)

A **Controller** handles incoming HTTP requests and returns responses. It does NOT contain business logic — it delegates to a Service.

```typescript
@Controller('todos')       // all routes start with /todos
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()                   // GET /todos
  findAll() {
    return this.todoService.findAll();   // delegates to service
  }

  @Post()                  // POST /todos
  create(@Body() dto: CreateTodoDto) {
    return this.todoService.create(dto);
  }

  @Get(':id')              // GET /todos/5
  findOne(@Param('id') id: string) {
    return this.todoService.findOne(+id);
  }
}
```

### Common HTTP Decorators

| Decorator | HTTP Method | Example Route |
|-----------|-------------|---------------|
| `@Get()` | GET | `GET /todos` |
| `@Post()` | POST | `POST /todos` |
| `@Patch(':id')` | PATCH | `PATCH /todos/1` |
| `@Delete(':id')` | DELETE | `DELETE /todos/1` |

### Common Parameter Decorators

| Decorator | What it extracts |
|-----------|-----------------|
| `@Body()` | The request body (JSON payload) |
| `@Param('id')` | A URL path parameter like `:id` |
| `@Query('page')` | A query string param like `?page=2` |
| `@Req()` | The entire Express request object |

### Analogy
The Controller is like a **receptionist**: they receive your request, figure out who to send you to, and hand back the response. They don't do the actual work.

---

## 3. Service (`@Injectable`)

A **Service** contains all the **business logic**. It talks to the database, processes data, and throws errors when something goes wrong.

```typescript
@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  async findAll(userId: number): Promise<Todo[]> {
    return this.todoRepository.find({ where: { userId } });
  }

  async create(dto: CreateTodoDto, userId: number): Promise<Todo> {
    const todo = this.todoRepository.create({ ...dto, userId });
    return this.todoRepository.save(todo);
  }
}
```

### Analogy
The Service is like the **actual employee** doing the real work — querying the database, applying rules, and returning results.

### Why Separate Controllers and Services?

| Controller | Service |
|------------|---------|
| Handles HTTP-specific stuff | Handles business logic |
| Extracts data from the request | Works with that data |
| Easy to swap (e.g., REST → GraphQL) | Reusable across multiple controllers |
| Thin — just delegates | Fat — all the real logic lives here |

---

## 4. Dependency Injection (DI)

**Dependency Injection** is the system NestJS uses to automatically provide a class with the things it needs (its "dependencies") without you having to `new` them up manually.

### Without DI (the hard way)
```typescript
// You'd have to manually create everything:
const userRepo = new Repository<User>(User);
const jwtService = new JwtService({ secret: '...' });
const authService = new AuthService(userRepo, jwtService);
const authController = new AuthController(authService);
```

### With DI (NestJS way)
```typescript
// NestJS figures it out automatically:
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //                                    ↑
  // NestJS sees this, finds AuthService in the module's providers,
  // creates ONE shared instance, and injects it here.
}
```

### How It Works Step by Step

1. You mark a class with `@Injectable()` → tells NestJS "I can be injected"
2. You add it to a module's `providers: []` array
3. Any class in that module that declares it in its constructor automatically receives it

```typescript
// Step 1: Mark it as injectable
@Injectable()
export class AuthService { ... }

// Step 2: Register it in the module
@Module({
  providers: [AuthService],   // ← registered here
  controllers: [AuthController],
})
export class AuthModule {}

// Step 3: Inject it (NestJS does this automatically)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //          ↑ NestJS injects the AuthService instance here
}
```

### The Golden Rule of DI
> **Singleton by default.** NestJS creates **one instance** of each service and shares it across all classes that need it. You don't need to worry about creating or destroying them.

---

## 5. The Request Lifecycle

When a request hits the server, it travels through these layers in order:

```
HTTP Request
     │
     ▼
  Guards          ← Is the user allowed to access this route? (e.g., JwtAuthGuard)
     │
     ▼
  Interceptors    ← Transform request/response (logging, caching, etc.)
     │
     ▼
  Pipes           ← Validate and transform input data (ValidationPipe)
     │
     ▼
  Controller      ← Handle the request, call the service
     │
     ▼
  Service         ← Execute business logic, query database
     │
     ▼
HTTP Response
```

In our project, the main layers you'll encounter are:

- **Guards** → `JwtAuthGuard` (protects routes)
- **Pipes** → `ValidationPipe` (validates DTOs)
- **Controllers** → `TodoController`, `AuthController`
- **Services** → `TodoService`, `AuthService`

---

## 6. Decorators — The NestJS Syntax

Everything in NestJS relies on **TypeScript decorators** — those `@Something` annotations. They are functions that add metadata or behavior to a class or method.

```typescript
@Controller('todos')          // ← class decorator: "this class handles /todos routes"
export class TodoController {

  @Get(':id')                 // ← method decorator: "this method handles GET /todos/:id"
  findOne(
    @Param('id') id: string,  // ← parameter decorator: "extract :id from the URL"
    @GetUser() user: User,    // ← custom parameter decorator: "extract user from JWT"
  ) { ... }
}
```

### Categories of Decorators

| Category | Examples | What They Do |
|----------|----------|-------------|
| Class decorators | `@Controller()`, `@Injectable()`, `@Module()` | Define what a class *is* |
| Method decorators | `@Get()`, `@Post()`, `@UseGuards()` | Define what a method *does* |
| Parameter decorators | `@Body()`, `@Param()`, `@GetUser()` | Extract specific data from the request |

---

## Summary

| Concept | Decorator | Role |
|---------|-----------|------|
| Module | `@Module()` | Groups related features; manages imports/exports |
| Controller | `@Controller()` | Handles HTTP routes; delegates to services |
| Service | `@Injectable()` | Business logic; talks to database |
| Guard | `@Injectable()` + extends `AuthGuard` | Protects routes |
| Entity | `@Entity()` | Defines a database table |
| DTO | plain class | Defines the shape and validation of incoming data |

**Next:** [File & Folder Structure →](./02-file-structure.md)
