interface EmptyStateProps {
  isLoading: boolean;
}

export function EmptyState({ isLoading }: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p>Loading todos...</p>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <span className="empty-icon">+</span>
      <p>No todos yet. Add one above!</p>
    </div>
  );
}
