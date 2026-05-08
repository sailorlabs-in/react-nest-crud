# 02 - File & Folder Structure

Goal: understand where frontend code lives and why the app is split this way.

## Top-Level Frontend Files

```text
frontend/
├── src/                  # All React source code
├── public/               # Static files copied as-is
├── index.html            # HTML shell used by Vite
├── package.json          # Scripts and dependencies
├── vite.config.ts        # Vite setup
└── tsconfig*.json        # TypeScript settings
```

## `src/main.tsx`

This is the frontend entry point.

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

It finds the `<div id="root">` from `index.html` and tells React to render the `App` component inside it.

## `src/App.tsx`

`App.tsx` is the main coordinator.

It owns the top-level state:

- current user
- JWT token
- todos
- loading state
- error messages

It also defines the main handlers:

- `handleLogin`
- `handleRegister`
- `handleLogout`
- `handleCreate`
- `handleToggle`
- `handleUpdate`
- `handleDelete`

`App.tsx` should not contain every input and every todo card. Those belong in components.

## `src/api/`

This folder contains backend communication.

```text
api/
├── apiClient.ts
├── authApi.ts
└── todoApi.ts
```

Why this is useful:

- The backend URL is written in one place.
- Token logic is written in one place.
- Components stay focused on UI.
- API functions are easier to test and reuse.

## `src/components/`

This folder contains reusable UI pieces.

```text
components/
├── AppBackground.tsx
├── AuthForm.tsx
├── EmptyState.tsx
├── ErrorBanner.tsx
├── TodoForm.tsx
├── TodoHeader.tsx
├── TodoItem.tsx
└── TodoList.tsx
```

Each component has one main job.

Example:

- `TodoForm` collects title/description and calls `onCreate`.
- `TodoItem` shows one todo and lets the user edit/toggle/delete it.
- `TodoList` decides whether to show loading, empty state, or todo cards.

## `src/types/`

This folder contains shared TypeScript interfaces.

```text
types/
└── index.ts
```

Examples:

- `Todo`
- `User`
- `LoginPayload`
- `RegisterPayload`
- `CreateTodoPayload`
- `UpdateTodoPayload`

When the backend changes, this is one of the first places to update.

## `src/App.css`

This file styles the app.

Components use class names like:

- `create-form`
- `todo-card`
- `error-banner`
- `btn`

The JSX decides structure. The CSS decides appearance.

## Why This Structure is Better Than One Huge File

A beginner can read one file at a time:

```text
Need to understand login UI? Read AuthForm.tsx.
Need to understand API calls? Read api/authApi.ts.
Need to understand app flow? Read App.tsx.
Need to understand todo card UI? Read TodoItem.tsx.
```

This is the main reason we separate files: less mental load.
