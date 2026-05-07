import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// ─── Types ───────────────────────────────────────────────────
interface Todo {
  id: number;
  title: string;
  description: string | null;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const API_URL = 'http://localhost:5000/api';

// Set up Axios interceptor to add the token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── App Component ──────────────────────────────────────────
function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  
  // Auth state
  const [isLoginView, setIsLoginView] = useState(true);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Todo state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Auth Methods ─────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get<User>(`${API_URL}/auth/profile`);
      setUser(response.data);
    } catch {
      handleLogout();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchProfile();
      fetchTodos();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setTodos([]);
    }
  }, [token, fetchProfile]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginView) {
        const res = await axios.post(`${API_URL}/auth/login`, {
          email: authEmail,
          password: authPassword,
        });
        setToken(res.data.accessToken);
      } else {
        const res = await axios.post(`${API_URL}/auth/register`, {
          name: authName,
          email: authEmail,
          password: authPassword,
        });
        setToken(res.data.accessToken);
      }
      // Reset form
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setAuthEmail('');
    setAuthPassword('');
  };

  // ─── Fetch all todos ────────────────────────────────────
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Todo[]>(`${API_URL}/todos`);
      setTodos(response.data);
      setError('');
    } catch {
      setError('Failed to fetch todos.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Create a new todo ──────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await axios.post(`${API_URL}/todos`, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      setTitle('');
      setDescription('');
      fetchTodos();
    } catch {
      setError('Failed to create todo');
    }
  };

  // ─── Toggle completion ──────────────────────────────────
  const toggleComplete = async (todo: Todo) => {
    try {
      await axios.patch(`${API_URL}/todos/${todo.id}`, {
        isComplete: !todo.isComplete,
      });
      fetchTodos();
    } catch {
      setError('Failed to update todo');
    }
  };

  // ─── Start editing ─────────────────────────────────────
  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
  };

  // ─── Save edit ──────────────────────────────────────────
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || editingId === null) return;

    try {
      await axios.patch(`${API_URL}/todos/${editingId}`, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      });
      setEditingId(null);
      fetchTodos();
    } catch {
      setError('Failed to update todo');
    }
  };

  // ─── Delete ─────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`);
      fetchTodos();
    } catch {
      setError('Failed to delete todo');
    }
  };

  // ─── Render Auth View ───────────────────────────────────
  if (!token) {
    return (
      <div className="app">
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        <div className="container" style={{ maxWidth: '400px' }}>
          <header className="header">
            <div className="logo">
              <span className="logo-icon">✦</span>
              <h1>Todo App</h1>
            </div>
            <p className="subtitle">{isLoginView ? 'Welcome back' : 'Create an account'}</p>
          </header>

          {authError && (
            <div className="error-banner">
              <span>⚠️ {authError}</span>
              <button onClick={() => setAuthError('')} className="error-close">✕</button>
            </div>
          )}

          <form className="create-form" onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!isLoginView && (
              <input
                type="text"
                placeholder="Full Name"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="input"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="input"
              required
              minLength={6}
            />
            <button type="submit" className="btn btn-add" style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}>
              {isLoginView ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="btn-link" 
              onClick={() => setIsLoginView(!isLoginView)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isLoginView ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ─── Render Main View ───────────────────────────────────
  const completedCount = todos.filter((t) => t.isComplete).length;
  const pendingCount = todos.length - completedCount;

  return (
    <div className="app">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="container">
        <header className="header">
          <div className="logo" style={{ justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="logo-icon">✦</span>
              <h1>Todo App</h1>
            </div>
            <button onClick={handleLogout} className="btn btn-cancel" style={{ padding: '6px 12px', fontSize: '13px' }}>
              Logout
            </button>
          </div>
          <p className="subtitle" style={{ textAlign: 'left', marginTop: '4px' }}>
            Welcome back, {user?.name || 'User'}
          </p>
          
          <div className="stats" style={{ justifyContent: 'flex-start', marginTop: '24px' }}>
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

        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="error-close">
              ✕
            </button>
          </div>
        )}

        <form className="create-form" onSubmit={handleCreate}>
          <div className="form-row">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-title"
              maxLength={255}
            />
            <button type="submit" className="btn btn-add" disabled={!title.trim()}>
              <span className="btn-icon">+</span> Add
            </button>
          </div>
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input input-desc"
          />
        </form>

        <div className="todo-list">
          {loading ? (
            <div className="empty-state">
              <div className="spinner" />
              <p>Loading todos...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <p>No todos yet. Add one above!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`todo-card ${todo.isComplete ? 'todo-done' : ''}`}
              >
                {editingId === todo.id ? (
                  <form className="edit-form" onSubmit={handleUpdate}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="input edit-input"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="input edit-input"
                      placeholder="Description"
                    />
                    <div className="edit-actions">
                      <button type="submit" className="btn btn-save">
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-cancel"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="todo-left" onClick={() => toggleComplete(todo)}>
                      <div className={`checkbox ${todo.isComplete ? 'checked' : ''}`}>
                        {todo.isComplete && <span>✓</span>}
                      </div>
                      <div className="todo-text">
                        <span className="todo-title">{todo.title}</span>
                        {todo.description && (
                          <span className="todo-desc">{todo.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button
                        className="btn-icon-action btn-edit"
                        onClick={() => startEdit(todo)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon-action btn-delete"
                        onClick={() => handleDelete(todo.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
