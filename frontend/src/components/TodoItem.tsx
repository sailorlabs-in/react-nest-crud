import { useState } from 'react';
import type { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: number) => Promise<void>;
  onToggle: (todo: Todo) => Promise<void>;
  onUpdate: (id: number, title: string, description: string) => Promise<void>;
}

export function TodoItem({ todo, onDelete, onToggle, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editTitle.trim()) {
      return;
    }

    await onUpdate(todo.id, editTitle, editDescription);
    setIsEditing(false);
  }

  return (
    <div className={`todo-card ${todo.isComplete ? 'todo-done' : ''}`}>
      {isEditing ? (
        <form className="edit-form" onSubmit={handleUpdate}>
          <input
            type="text"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            className="input edit-input"
            autoFocus
          />
          <input
            type="text"
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            className="input edit-input"
            placeholder="Description"
          />
          <div className="edit-actions">
            <button type="submit" className="btn btn-save">
              Save
            </button>
            <button type="button" className="btn btn-cancel" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <button className="todo-left" onClick={() => onToggle(todo)} type="button">
            <span className={`checkbox ${todo.isComplete ? 'checked' : ''}`}>
              {todo.isComplete && <span>✓</span>}
            </span>
            <span className="todo-text">
              <span className="todo-title">{todo.title}</span>
              {todo.description && <span className="todo-desc">{todo.description}</span>}
            </span>
          </button>
          <div className="todo-actions">
            <button
              className="btn-icon-action btn-edit"
              onClick={() => setIsEditing(true)}
              title="Edit"
              type="button"
            >
              Edit
            </button>
            <button
              className="btn-icon-action btn-delete"
              onClick={() => onDelete(todo.id)}
              title="Delete"
              type="button"
            >
              Del
            </button>
          </div>
        </>
      )}
    </div>
  );
}
