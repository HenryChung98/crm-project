"use server";
import { ContactType } from "@/types/database/customers";
import { requireOrgAccess } from "@/shared-utils/org-access";

export async function getContactsDB(orgId: string): Promise<ContactType[] | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

  const { data, error } = await supabase.from("contacts").select("*").eq("organization_id", orgId);

  if (error) throw error;

  return data ?? [];
}
