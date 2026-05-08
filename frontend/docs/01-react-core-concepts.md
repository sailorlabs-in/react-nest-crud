# 01 - React Core Concepts

Goal: understand the basic React ideas before reading the app code.

## What is React?

React is a JavaScript library for building user interfaces. Instead of manually changing HTML with many DOM commands, you describe what the UI should look like for the current data, and React updates the page.

In this project, React handles:

- Showing the login/register screen when the user has no token.
- Showing the todo dashboard when the user is logged in.
- Re-rendering the todo list after create, update, toggle, or delete actions.

## 1. Components

A component is a reusable piece of UI.

```tsx
function ErrorBanner({ message }: { message: string }) {
  return <div>{message}</div>;
}
```

In this app:

- `AuthForm` handles login/register UI.
- `TodoForm` handles creating todos.
- `TodoList` renders a collection of todos.
- `TodoItem` renders one todo.
- `TodoHeader` shows user info and stats.

Think of components like small building blocks. Each one should have one clear job.

## 2. JSX

JSX lets you write HTML-like syntax inside TypeScript.

```tsx
return (
  <button className="btn" type="button">
    Logout
  </button>
);
```

JSX is not a string. Vite and React compile it into JavaScript.

Important JSX rules:

- Use `className` instead of `class`.
- Use `htmlFor` instead of `for`.
- Return one parent element from a component.
- Use `{}` when inserting JavaScript values.

## 3. Props

Props are inputs passed from a parent component to a child component.

```tsx
<TodoHeader todos={todos} user={user} onLogout={handleLogout} />
```

Here, `App.tsx` passes three props into `TodoHeader`:

- `todos`: the current todo array
- `user`: the logged-in user
- `onLogout`: a function to call when logout is clicked

Props make components reusable because the same component can render different data.

## 4. State

State is data that belongs to a component and can change over time.

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
```

In this app, `App.tsx` stores important state:

- `todos`
- `user`
- `token`
- `authError`
- `todoError`
- `isLoadingTodos`

When state changes, React re-renders the component so the screen matches the new data.

## 5. Events

React uses event handlers for user actions.

```tsx
<button onClick={handleLogout} type="button">
  Logout
</button>
```

Common events in this app:

- `onSubmit` for forms
- `onChange` for inputs
- `onClick` for buttons

## 6. Effects

`useEffect` runs code after React renders. It is useful for side effects like loading data.

```tsx
useEffect(() => {
  if (!token) {
    handleLogout();
    return;
  }

  saveToken(token);
  void loadProfile();
  void loadTodos();
}, [handleLogout, loadProfile, loadTodos, token]);
```

In this app, the effect runs when the token changes:

- If no token exists, the app logs out.
- If a token exists, the app saves it and loads profile/todos.

## 7. TypeScript Types

Types describe the shape of data.

```typescript
export interface Todo {
  id: number;
  title: string;
  description: string | null;
  isComplete: boolean;
}
```

Because `Todo` is typed, TypeScript can warn you if you try to use a field that does not exist.

## Big Picture

React apps are mostly this loop:

```text
State changes -> React re-renders -> User interacts -> Event handler updates state
```

In this project:

```text
User clicks Add -> App calls API -> todos state updates -> TodoList re-renders
```
