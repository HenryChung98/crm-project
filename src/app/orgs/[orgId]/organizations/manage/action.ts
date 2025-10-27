"use server";

import { revalidatePath } from "next/cache";
import { withOrgAuth } from "@/utils/auth";

export async function updateMemberRole(orgId: string, formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const newRole = formData.get("role") as string;
  const organizationId = formData.get("organizationId") as string;

  try {
    const { supabase } = await withOrgAuth(orgId, ["owner"]);

    // Update member role
    const { data, error } = await supabase
      .from("organization_members")
      .update({ role: newRole })
      .eq("id", memberId)
      .eq("organization_id", organizationId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/organizations/manage");
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}

export async function removeMember(memberId: string, organizationId: string) {
  try {
    const { supabase, orgMember } = await withOrgAuth(organizationId, ["owner"]);

    if (orgMember.id === memberId) {
      return { success: false, error: "You cannot remove yourself from the organization" };
    }

    const { data: memberToRemove, error: fetchError } = await supabase
      .from("organization_members")
      .select("id")
      .eq("id", memberId)
      .eq("organization_id", organizationId)
      .single();

    if (fetchError || !memberToRemove) {
      return { success: false, error: "Member not found or access denied" };
    }

    const { error: deleteError } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId)
      .eq("organization_id", organizationId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    revalidatePath("/organizations/manage");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}
