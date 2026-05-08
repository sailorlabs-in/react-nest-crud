# 04 - Components & State Flow

Goal: understand how data moves between `App.tsx` and the UI components.

## Parent and Child Components

`App.tsx` is the parent. Components inside `src/components/` are children.

Example:

```tsx
<TodoForm onCreate={handleCreate} />
```

`App.tsx` gives `TodoForm` a function. `TodoForm` calls that function when the user submits the form.

## Why State Lives in `App.tsx`

The todo list, header stats, and todo actions all need the same todo data.

If state lived inside `TodoList`, then `TodoHeader` could not easily show total/done/pending counts.

So `App.tsx` owns shared state:

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
```

Then it passes data down:

```tsx
<TodoHeader todos={todos} user={user} onLogout={handleLogout} />
<TodoList todos={todos} onToggle={handleToggle} />
```

This pattern is called "lifting state up."

## Component Responsibilities

## `AuthForm`

Owns form fields for:

- name
- email
- password
- login/register mode

It does not call Axios. It calls:

- `onLogin(payload)`
- `onRegister(payload)`

## `TodoForm`

Owns the create todo input fields:

- title
- description

After submit, it calls:

```tsx
await onCreate(title, description);
```

## `TodoHeader`

Receives todos and calculates:

- total count
- completed count
- pending count

It also receives `onLogout`.

## `TodoList`

Chooses what to show:

- loading state
- empty state
- list of `TodoItem` components

## `TodoItem`

Owns edit mode for one todo.

Local state:

- `isEditing`
- `editTitle`
- `editDescription`

Shared todo data still comes from `App.tsx`.

## Data Moves Down, Events Move Up

This is one of the most important React patterns.

```text
App.tsx gives data to components through props.
Components report user actions back through callback props.
```

Example:

```text
App.tsx -> TodoList -> TodoItem
todos data moves down

TodoItem -> onToggle(todo) -> App.tsx
event moves up
```

## Why Components Do Not Import API Functions

In this app, components stay UI-focused. They do not import `todoApi.ts` directly.

That gives us a clean split:

```text
components/ = what the user sees and clicks
api/        = how HTTP requests are made
App.tsx     = connects UI events to API calls
```

This makes the app easier to teach, test, and change.
