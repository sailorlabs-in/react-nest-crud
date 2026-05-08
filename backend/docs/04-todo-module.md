# 04 — Todo Module Deep Dive

> **Goal:** Understand how the Todo CRUD works, what DTOs and Entities are, how TypeORM maps code to database tables, and how user-scoping keeps data secure.

---

## Module Overview

```
todo/
├── todo.module.ts       → wires everything together, imports AuthModule for guards
├── todo.controller.ts   → handles HTTP requests, protected by JwtAuthGuard
├── todo.service.ts      → user-scoped CRUD logic
├── dto/
│   ├── create-todo.dto.ts   → validates POST /api/todos body
│   └── update-todo.dto.ts   → validates PATCH /api/todos/:id body
└── entities/
    └── todo.entity.ts       → defines the `todos` database table
```

---

## Part 1: Entity — The Database Table

### File: `todo/entities/todo.entity.ts`

An **Entity** is a TypeScript class that TypeORM maps to a database table. Every property decorated with a TypeORM decorator becomes a column.

```typescript
@Entity('todos')   // ← creates/maps to a table named "todos"
export class Todo {

  @PrimaryGeneratedColumn()
  id: number;
  // → SERIAL PRIMARY KEY (auto-increments: 1, 2, 3...)

  @Column({ type: 'varchar', length: 255 })
  title: string;
  // → title VARCHAR(255) NOT NULL

  @Column({ type: 'text', nullable: true })
  description: string | null;
  // → description TEXT  (can be NULL)

  @Column({ name: 'is_complete', type: 'boolean', default: false })
  isComplete: boolean;
  // → is_complete BOOLEAN DEFAULT false
  //   Note: `name: 'is_complete'` = snake_case in DB, camelCase in TypeScript

  @ManyToOne(() => User, (user) => user.todos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  // → user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  //   ManyToOne: "many todos belong to one user"
  //   onDelete: 'CASCADE' → delete user → all their todos are deleted too

  @Column({ name: 'user_id' })
  userId: number;
  // → This stores just the user_id number directly
  //   Convenient for filtering: WHERE user_id = ?

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  // → created_at TIMESTAMP — automatically set on INSERT

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  // → updated_at TIMESTAMP — automatically updated on every SAVE
}
```

### What the Database Table Looks Like

```sql
CREATE TABLE todos (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP NOT NULL DEFAULT now()
);
```

### TypeORM Decorator Cheat Sheet

| Decorator | SQL Equivalent | Notes |
|-----------|----------------|-------|
| `@Entity('todos')` | `CREATE TABLE todos` | Class = table |
| `@PrimaryGeneratedColumn()` | `SERIAL PRIMARY KEY` | Auto-increment ID |
| `@Column()` | `column_name TYPE NOT NULL` | Regular column |
| `@Column({ nullable: true })` | `column_name TYPE` | Allows NULL |
| `@Column({ default: false })` | `DEFAULT false` | Default value |
| `@CreateDateColumn()` | `DEFAULT now()` on INSERT | Auto timestamp |
| `@UpdateDateColumn()` | Auto-updates on save | Auto timestamp |
| `@ManyToOne(...)` | `FOREIGN KEY REFERENCES` | Relationship |

---

## Part 2: DTOs — Validating Input Data

DTOs (Data Transfer Objects) define **what data the client is allowed to send** and enforce validation rules.

### Why Are DTOs Separate from Entities?

| | Entity | DTO |
|--|--------|-----|
| **Purpose** | Maps to a database table | Defines API input shape |
| **Contains** | All columns (id, createdAt, etc.) | Only what the client can send |
| **Used by** | TypeORM (DB layer) | ValidationPipe (HTTP layer) |
| **Example** | `todo.entity.ts` | `create-todo.dto.ts` |

The client should **not** send `id`, `createdAt`, or `userId` — those are set by the server. DTOs enforce this separation.

---

### File: `dto/create-todo.dto.ts`

```typescript
export class CreateTodoDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MaxLength(255)
  @ApiProperty({ example: 'Buy groceries' })
  title: string;

  @IsString()
  @IsOptional()           // ← this field is not required
  @ApiPropertyOptional({ example: 'Milk, eggs, bread' })
  description?: string;
}
```

**Valid request:**
```json
POST /api/todos
{ "title": "Buy groceries", "description": "Milk and eggs" }
```

**Invalid request → 400 Bad Request:**
```json
POST /api/todos
{ "title": "" }

Response: {
  "statusCode": 400,
  "message": ["Title cannot be empty"],
  "error": "Bad Request"
}
```

---

### File: `dto/update-todo.dto.ts`

```typescript
export class UpdateTodoDto extends PartialType(CreateTodoDto) {
  @IsBoolean()
  @IsOptional()
  isComplete?: boolean;
}
```

`PartialType(CreateTodoDto)` is a **NestJS utility** that copies `CreateTodoDto` but makes all its fields optional. This is perfect for PATCH requests where you only send the fields you want to change:

```json
PATCH /api/todos/1
{ "isComplete": true }        // ✅ only update completion

PATCH /api/todos/1
{ "title": "New title" }      // ✅ only update title

PATCH /api/todos/1
{ }                            // ✅ valid — nothing changes
```

We add `isComplete` here (not in `CreateTodoDto`) because a todo always starts as `false` — you can't create a todo and immediately mark it done.

---

## Part 3: Service — User-Scoped CRUD

### File: `todo/todo.service.ts`

The service is where all the database operations happen. The key pattern here is **user-scoping** — every method receives `userId` and uses it to ensure users can only see/modify their own data.

### CREATE

```typescript
async create(createTodoDto: CreateTodoDto, userId: number): Promise<Todo> {
  const todo = this.todoRepository.create({
    ...createTodoDto,   // spread: title, description from the DTO
    userId,             // attach the authenticated user's ID
  });
  return this.todoRepository.save(todo);
  // .create() → creates an in-memory Todo object (doesn't hit DB)
  // .save()   → executes INSERT INTO todos ... (hits DB)
}
```

### READ ALL (user-scoped)

```typescript
async findAll(userId: number): Promise<Todo[]> {
  return this.todoRepository.find({
    where: { userId },              // WHERE user_id = ?
    order: { createdAt: 'DESC' },   // ORDER BY created_at DESC
  });
}
```

SQL executed: `SELECT * FROM todos WHERE user_id = 1 ORDER BY created_at DESC`

### READ ONE (with ownership check)

```typescript
async findOne(id: number, userId: number): Promise<Todo> {
  // Step 1: Does the todo exist at all?
  const todo = await this.todoRepository.findOneBy({ id });
  if (!todo) throw new NotFoundException(`Todo with ID ${id} not found`);
  //                   ↑ returns HTTP 404

  // Step 2: Does it belong to THIS user?
  if (todo.userId !== userId) {
    throw new ForbiddenException('You can only access your own todos');
    //         ↑ returns HTTP 403 (not 404 — we don't hide that it exists)
  }

  return todo;
}
```

This two-step check prevents **IDOR (Insecure Direct Object Reference)** attacks — where a user guesses another user's todo ID and accesses it.

### UPDATE

```typescript
async update(id: number, updateTodoDto: UpdateTodoDto, userId: number): Promise<Todo> {
  const todo = await this.findOne(id, userId);  // ← reuses findOne (checks existence + ownership)
  Object.assign(todo, updateTodoDto);            // merge only the changed fields
  return this.todoRepository.save(todo);         // UPDATE todos SET ... WHERE id = ?
}
```

### DELETE

```typescript
async remove(id: number, userId: number): Promise<void> {
  const todo = await this.findOne(id, userId);  // ← reuses findOne
  await this.todoRepository.remove(todo);       // DELETE FROM todos WHERE id = ?
}
```

---

## Part 4: Controller — Routes

### File: `todo/todo.controller.ts`

All routes in `TodoController` are protected by `@UseGuards(JwtAuthGuard)` applied at the **class level** — meaning every single route inside automatically requires authentication.

```typescript
@ApiTags('todos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)   // ← protects ALL routes in this controller
@Controller('todos')       // ← base path: /todos (+ /api prefix = /api/todos)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @GetUser() user: User) {
    return this.todoService.create(createTodoDto, user.id);
    //                                          ↑ pass the authenticated user's ID
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.todoService.findAll(user.id);  // only returns THIS user's todos
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    //            ↑ automatically converts ":id" string → number
    //              throws 400 if it's not a valid integer (e.g., /todos/abc)
    @GetUser() user: User,
  ) {
    return this.todoService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
    @GetUser() user: User,
  ) {
    return this.todoService.update(id, updateTodoDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)   // ← returns 204 (no body) instead of default 200
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.todoService.remove(id, user.id);
  }
}
```

### `ParseIntPipe` — What It Does

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) { ... }
```

URL params are always strings. `ParseIntPipe` automatically converts `"5"` → `5` before your method runs. If someone hits `/api/todos/abc`, it returns:
```json
{ "statusCode": 400, "message": "Validation failed (numeric string is expected)" }
```

---

## Part 5: The Module

### File: `todo/todo.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    // ↑ Registers the Todo entity in THIS module's context.
    //   This allows AuthService to inject Repository<Todo>.
    //   forFeature() = use this entity in this feature module
    //   forRoot()    = configure the DB connection (only in AppModule)

    AuthModule,
    // ↑ Imports AuthModule so we can use JwtAuthGuard in this controller.
    //   AuthModule exports [JwtStrategy, PassportModule],
    //   which is everything JwtAuthGuard needs to work.
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
```

---

## Complete Request Flow Example

### `GET /api/todos` with a valid JWT

```
1. Request arrives:
   GET /api/todos
   Headers: { Authorization: "Bearer eyJhbGc..." }

2. Global prefix routing:
   /api/todos → routes to TodoController

3. JwtAuthGuard runs (applied at class level):
   → Extracts token from header
   → Verifies signature
   → Calls JwtStrategy.validate({ sub: 1, email: "john@example.com" })
   → Looks up user in DB: SELECT * FROM users WHERE id = 1
   → Attaches user to request.user

4. @GetUser() decorator in findAll():
   → extracts request.user → { id: 1, name: "John", ... }

5. TodoController.findAll(@GetUser() user):
   → calls todoService.findAll(1)  // userId = 1

6. TodoService.findAll(1):
   → SELECT * FROM todos WHERE user_id = 1 ORDER BY created_at DESC

7. Response:
   [
     { "id": 2, "title": "Code NestJS", "isComplete": false, ... },
     { "id": 1, "title": "Buy milk", "isComplete": true, ... }
   ]
```

---

**Next:** [Cross-Module Sharing →](./05-cross-module-sharing.md)
