# 05 - Auth & Todo Flow

Goal: understand the full user journey from login to todo CRUD.

## First Page Load

When the app starts, `App.tsx` checks for an existing token:

```tsx
const [token, setToken] = useState<string | null>(getStoredToken());
```

There are two possible paths:

```text
No token -> show AuthForm
Token exists -> load profile and todos
```

## Register Flow

```text
User fills register form
  -> AuthForm calls onRegister
  -> App calls register(payload)
  -> POST /api/auth/register
  -> Backend returns accessToken and user
  -> App saves token
  -> App shows todo dashboard
```

Request body:

```json
{
  "name": "Umang",
  "email": "umang@example.com",
  "password": "secret123"
}
```

## Login Flow

```text
User fills login form
  -> AuthForm calls onLogin
  -> App calls login(payload)
  -> POST /api/auth/login
  -> Backend returns accessToken and user
  -> App saves token
  -> App shows todo dashboard
```

Request body:

```json
{
  "email": "umang@example.com",
  "password": "secret123"
}
```

## Profile Flow

After login or refresh, the app calls:

```typescript
getProfile()
```

That sends:

```text
GET /api/auth/profile
Authorization: Bearer <token>
```

If the token is valid, the backend returns the current user.

If the token is invalid or expired, the app logs out.

## Todo Loading Flow

After authentication, the app calls:

```typescript
getTodos()
```

That sends:

```text
GET /api/todos
Authorization: Bearer <token>
```

The backend returns only the todos that belong to the logged-in user.

## Create Todo Flow

```text
User submits TodoForm
  -> App calls createTodo()
  -> POST /api/todos
  -> App reloads todos
  -> TodoList re-renders
```

Request body:

```json
{
  "title": "Learn React",
  "description": "Understand components and state"
}
```

## Toggle Todo Flow

```text
User clicks a todo
  -> App calls updateTodo(todo.id, { isComplete: !todo.isComplete })
  -> PATCH /api/todos/:id
  -> App reloads todos
```

Request body:

```json
{
  "isComplete": true
}
```

## Edit Todo Flow

```text
User clicks Edit
  -> TodoItem shows edit inputs
  -> User clicks Save
  -> App calls updateTodo(id, payload)
  -> App reloads todos
```

Request body:

```json
{
  "title": "Learn React deeply",
  "description": "Practice by building small apps"
}
```

## Delete Todo Flow

```text
User clicks Del
  -> App calls deleteTodo(id)
  -> DELETE /api/todos/:id
  -> App reloads todos
```

The backend returns `204 No Content` when deletion succeeds.

## Logout Flow

```text
User clicks Logout
  -> App clears localStorage token
  -> App clears user and todos state
  -> App shows AuthForm
```

Logout does not need a backend request because JWT auth is stateless in this project.
