import { useState } from 'react';
import { ErrorBanner } from './ErrorBanner';
import type { LoginPayload, RegisterPayload } from '../types';

interface AuthFormProps {
  error: string;
  onDismissError: () => void;
  onLogin: (payload: LoginPayload) => Promise<void>;
  onRegister: (payload: RegisterPayload) => Promise<void>;
}

export function AuthForm({
  error,
  onDismissError,
  onLogin,
  onRegister,
}: AuthFormProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoginView) {
      await onLogin({ email, password });
    } else {
      await onRegister({ name, email, password });
    }

    setPassword('');
  }

  return (
    <div className="container auth-container">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">*</span>
          <h1>Todo App</h1>
        </div>
        <p className="subtitle">{isLoginView ? 'Welcome back' : 'Create an account'}</p>
      </header>

      <ErrorBanner message={error} onDismiss={onDismissError} />

      <form className="create-form auth-form" onSubmit={handleSubmit}>
        {!isLoginView && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="input"
          required
          minLength={6}
        />
        <button type="submit" className="btn btn-add btn-full">
          {isLoginView ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <p className="auth-switch">
        {isLoginView ? "Don't have an account? " : 'Already have an account? '}
        <button className="btn-link" onClick={() => setIsLoginView(!isLoginView)} type="button">
          {isLoginView ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
