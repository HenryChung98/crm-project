import type { PostgrestError } from "@supabase/supabase-js";

export interface SupabaseError extends PostgrestError {
  status?: number;
  statusCode?: number;
}

export interface NetworkError extends Error {
  code?: string;
  status?: number;
}

export type QueryError = SupabaseError | NetworkError | Error;
