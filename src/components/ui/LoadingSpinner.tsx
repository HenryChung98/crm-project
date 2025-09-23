export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

export const FetchingSpinner: React.FC = () => (
  // <div className="flex items-center justify-center py-4">
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600 text-sm">Fetching...</span>
  </div>
);
