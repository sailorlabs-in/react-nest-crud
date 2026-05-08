import { EmptyState } from './EmptyState';
import { TodoItem } from './TodoItem';
import type { Todo } from '../types';

interface TodoListProps {
  isLoading: boolean;
  todos: Todo[];
  onDelete: (id: number) => Promise<void>;
  onToggle: (todo: Todo) => Promise<void>;
  onUpdate: (id: number, title: string, description: string) => Promise<void>;
}

export function TodoList({
  isLoading,
  todos,
  onDelete,
  onToggle,
  onUpdate,
}: TodoListProps) {
  if (isLoading || todos.length === 0) {
    return (
      <div className="todo-list">
        <EmptyState isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={onDelete}
          onToggle={onToggle}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
