# 03 - API Layer

Goal: understand how the frontend talks to the NestJS backend.

## Why Create an API Layer?

Without an API layer, components often contain code like this:

```tsx
await axios.get('http://localhost:5000/api/todos');
```

That works, but it spreads backend details across the UI.

With an API layer, components call a named function instead:

```tsx
const todoList = await getTodos();
```

This is easier to read and easier to maintain.

## `apiClient.ts`

`apiClient.ts` creates one configured Axios instance.

```typescript
export const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});
```

Because `baseURL` is set, other files can use short paths:

```typescript
apiClient.get('/todos');
apiClient.post('/auth/login', payload);
```

## Token Storage

The backend protects todo routes with JWT authentication. The frontend stores the token in `localStorage`.

```typescript
export function saveToken(token: string) {
  localStorage.setItem('token', token);
}
```

`localStorage` keeps the token after a browser refresh.

## Axios Request Interceptor

An interceptor runs before every request.

```typescript
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

This means components do not manually add the auth header. Axios handles it for every request.

## Auth API

`authApi.ts` contains authentication requests.

```typescript
export async function login(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
}
```

Functions in this file:

- `login(payload)`
- `register(payload)`
- `getProfile()`

## Todo API

`todoApi.ts` contains todo CRUD requests.

```typescript
export async function updateTodo(id: number, payload: UpdateTodoPayload) {
  const response = await apiClient.patch<Todo>(`/todos/${id}`, payload);
  return response.data;
}
```

Functions in this file:

- `getTodos()`
- `createTodo(payload)`
- `updateTodo(id, payload)`
- `deleteTodo(id)`

## Error Message Helper

Backend errors can return messages in different shapes. The helper turns them into a string.

```typescript
export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}
```

This keeps error handling consistent in `App.tsx`.

## Request Flow

```text
Component event
  -> App handler
    -> API function
      -> apiClient
        -> NestJS backend
          -> response data
    -> App updates state
  -> React re-renders UI
```
