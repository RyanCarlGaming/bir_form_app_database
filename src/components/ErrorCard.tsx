interface ErrorCardProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="rounded-lg border border-red/30 bg-red/5 p-4">
      <p className="text-sm text-red">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-xs underline text-red">
          Retry
        </button>
      )}
    </div>
  );
}
