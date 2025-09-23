import React from "react";
import { NetworkError } from "@/types/errors";
import { Button } from "./Button";

export const ErrorMessage: React.FC<{ message?: string }> = ({ message = "An error occurred" }) => (
  <div className="flex items-center justify-center">
    <div className="flex items-center text-red-600">
      <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-text-secondary">{message}</span>
    </div>
  </div>
);

export const QueryErrorUI: React.FC<{
  error?: Error;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  const getErrorMessage = (error?: Error) => {
    if (!error) return "Failed to load data";

    // NetworkError의 code 체크 (Supabase/PostgREST 에러)
    const networkError = error as NetworkError;
    if (networkError?.code === "PGRST301") {
      return "No data found";
    }

    return error.message || "Something went wrong";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="flex items-center text-red-600">
        <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-text-secondary">{getErrorMessage(error)}</span>
      </div>
      {onRetry && (
        <Button variant="warning" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};
