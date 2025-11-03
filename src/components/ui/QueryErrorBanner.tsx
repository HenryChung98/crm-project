interface ErrorBannerProps {
  data: string;
  onRetry?: () => void;
}

export const QueryErrorBanner = ({ data, onRetry }: ErrorBannerProps) => {
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between">
      <span className="text-sm text-red-800">Unable to check {data}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-red-600 hover:text-red-800 underline">
          Retry
        </button>
      )}
    </div>
  );
};
