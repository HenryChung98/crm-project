import { SupabaseError } from "@/types/errors";
import { revalidateTag } from "next/cache";
import { useAuth } from "@/contexts/AuthContext";
// type
import { OrganizationInvitations } from "@/types/database/organizations";

export async function getOrganizationInvitationsByEmail(): Promise<OrganizationInvitations[]> {
  const { user, supabase } = useAuth();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = (await supabase
    .from("organization_invitations")
    .select("id, organization_id, email, organizations(name)")
    .eq("email", user.email)
    .eq("accepted", false)) as { data: OrganizationInvitations[] | null; error: SupabaseError };

  if (error) throw error;
  return data || [];
}
