import { NetworkError } from "./errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EMPTY_ARRAY: any[] = [];

export interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: NetworkError | null;
  refetch?: () => void;
  isFetching?: boolean;
  isRefetching?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  isStale?: boolean;
  status?: "idle" | "loading" | "error" | "success";
}

export interface QueryResultArray<T> {
  data: T[] | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
  isFetching?: boolean;
  isRefetching?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  isStale?: boolean;
  status?: "idle" | "loading" | "error" | "success";
}
