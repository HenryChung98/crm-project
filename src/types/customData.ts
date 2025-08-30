// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EMPTY_ARRAY: any[] = [];

export interface QueryResult<T> {
  data: T[];
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  // isRefetching: boolean;
  // isSuccess: boolean;
  // isError: boolean;
  // isStale: boolean;
  // status: "idle" | "loading" | "error" | "success";
  refetch: () => void;
};
