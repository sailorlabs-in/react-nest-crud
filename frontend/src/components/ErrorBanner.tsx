interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-banner">
      <span>! {message}</span>
      <button onClick={onDismiss} className="error-close" type="button">
        x
      </button>
    </div>
  );
}
