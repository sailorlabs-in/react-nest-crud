import type { Todo, User } from '../types';

interface TodoHeaderProps {
  todos: Todo[];
  user: User | null;
  onLogout: () => void;
}

export function TodoHeader({ todos, user, onLogout }: TodoHeaderProps) {
  const completedCount = todos.filter((todo) => todo.isComplete).length;
  const pendingCount = todos.length - completedCount;

  return (
    <header className="header header-dashboard">
      <div className="logo logo-spread">
        <div className="brand-mark">
          <span className="logo-icon">*</span>
          <h1>Todo App</h1>
        </div>
        <button onClick={onLogout} className="btn btn-cancel btn-small" type="button">
          Logout
        </button>
      </div>

      <p className="subtitle subtitle-left">Welcome back, {user?.name || 'User'}</p>

      <div className="stats stats-left">
        <span className="stat">
          <span className="stat-dot stat-dot-total" />
          {todos.length} Total
        </span>
        <span className="stat">
          <span className="stat-dot stat-dot-done" />
          {completedCount} Done
        </span>
        <span className="stat">
          <span className="stat-dot stat-dot-pending" />
          {pendingCount} Pending
        </span>
      </div>
    </header>
  );
}
