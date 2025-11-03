"use server";

import { createClient } from "../supabase/server";

export async function ownOrganization(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}
