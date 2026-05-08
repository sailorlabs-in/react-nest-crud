import { useState } from 'react';

interface TodoFormProps {
  onCreate: (title: string, description: string) => Promise<void>;
}

export function TodoForm({ onCreate }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    await onCreate(title, description);
    setTitle('');
    setDescription('');
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
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
        onChange={(event) => setDescription(event.target.value)}
        className="input input-desc"
      />
    </form>
  );
}
