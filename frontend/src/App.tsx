import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { getProfile, login, register } from './api/authApi';
import { clearToken, getApiErrorMessage, getStoredToken, saveToken } from './api/apiClient';
import { createTodo, deleteTodo, getTodos, updateTodo } from './api/todoApi';
import { AppBackground } from './components/AppBackground';
import { AuthForm } from './components/AuthForm';
import { ErrorBanner } from './components/ErrorBanner';
import { TodoForm } from './components/TodoForm';
import { TodoHeader } from './components/TodoHeader';
import { TodoList } from './components/TodoList';
import type { LoginPayload, RegisterPayload, Todo, User } from './types';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [authError, setAuthError] = useState('');
  const [todoError, setTodoError] = useState('');
  const [isLoadingTodos, setIsLoadingTodos] = useState(Boolean(getStoredToken()));

  const handleLogout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
    setTodos([]);
  }, []);

  const loadTodos = useCallback(async () => {
    try {
      setIsLoadingTodos(true);
      const todoList = await getTodos();
      setTodos(todoList);
      setTodoError('');
    } catch (error) {
      setTodoError(getApiErrorMessage(error, 'Failed to fetch todos.'));
    } finally {
      setIsLoadingTodos(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      clearToken();
      return;
    }

    let isActive = true;

    saveToken(token);

    getProfile()
      .then((profile) => {
        if (isActive) {
          setUser(profile);
        }
      })
      .catch(() => {
        if (isActive) {
          handleLogout();
        }
      });

    getTodos()
      .then((todoList) => {
        if (isActive) {
          setTodos(todoList);
          setTodoError('');
        }
      })
      .catch((error) => {
        if (isActive) {
          setTodoError(getApiErrorMessage(error, 'Failed to fetch todos.'));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingTodos(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [handleLogout, token]);

  async function handleLogin(payload: LoginPayload) {
    try {
      setAuthError('');
      const response = await login(payload);
      saveToken(response.accessToken);
      setToken(response.accessToken);
      setUser(response.user);
      setIsLoadingTodos(true);
    } catch (error) {
      setAuthError(getApiErrorMessage(error, 'Authentication failed'));
    }
  }

  async function handleRegister(payload: RegisterPayload) {
    try {
      setAuthError('');
      const response = await register(payload);
      saveToken(response.accessToken);
      setToken(response.accessToken);
      setUser(response.user);
      setIsLoadingTodos(true);
    } catch (error) {
      setAuthError(getApiErrorMessage(error, 'Authentication failed'));
    }
  }

  async function handleCreate(title: string, description: string) {
    try {
      await createTodo({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      await loadTodos();
    } catch (error) {
      setTodoError(getApiErrorMessage(error, 'Failed to create todo.'));
    }
  }

  async function handleToggle(todo: Todo) {
    try {
      await updateTodo(todo.id, { isComplete: !todo.isComplete });
      await loadTodos();
    } catch (error) {
      setTodoError(getApiErrorMessage(error, 'Failed to update todo.'));
    }
  }

  async function handleUpdate(id: number, title: string, description: string) {
    try {
      await updateTodo(id, {
        title: title.trim(),
        description: description.trim() || null,
      });
      await loadTodos();
    } catch (error) {
      setTodoError(getApiErrorMessage(error, 'Failed to update todo.'));
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTodo(id);
      await loadTodos();
    } catch (error) {
      setTodoError(getApiErrorMessage(error, 'Failed to delete todo.'));
    }
  }

  if (!token) {
    return (
      <AppBackground>
        <AuthForm
          error={authError}
          onDismissError={() => setAuthError('')}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <div className="container">
        <TodoHeader todos={todos} user={user} onLogout={handleLogout} />
        <ErrorBanner message={todoError} onDismiss={() => setTodoError('')} />
        <TodoForm onCreate={handleCreate} />
        <TodoList
          isLoading={isLoadingTodos}
          todos={todos}
          onDelete={handleDelete}
          onToggle={handleToggle}
          onUpdate={handleUpdate}
        />
      </div>
    </AppBackground>
  );
}

export default App;
