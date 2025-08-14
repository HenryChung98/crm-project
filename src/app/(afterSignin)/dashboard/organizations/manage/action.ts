// action.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withOrgAuth } from "@/utils/auth";

export async function updateMemberRole(orgId: string, formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const newRole = formData.get("role") as string;
  const organizationId = formData.get("organizationId") as string;

  try {
    const { user, orgMember, supabase } = await withOrgAuth(orgId, ["owner"]);

    // Update member role
    const { data, error } = await supabase
      .from("organization_members")
      .update({ role: newRole })
      .eq("id", memberId)
      .eq("organization_id", organizationId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/organizations/manage");
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const removeId = formData.get("removeId") as string;
  const organizationId = formData.get("organizationId") as string;

  try {
    // Check if current user is owner
    const { data: currentMember } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", organizationId)
      .single();

    if (currentMember?.role !== "owner") {
      return { success: false, error: "Owner role required." };
    }

    // Remove member
    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", removeId)
      .eq("organization_id", organizationId);

    if (error) throw error;

    revalidatePath("/dashboard/organizations/manage");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}
