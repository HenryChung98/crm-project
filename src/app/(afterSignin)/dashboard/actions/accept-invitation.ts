"use server";

import { createClient } from "@/utils/supabase/server";

export async function acceptInvitation(inviteId: string, orgName: string | undefined) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요합니다.");

  // 2. invitation 유효성 확인
  const { data: invitation, error: inviteError } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("organization_id", inviteId)
    .eq("email", user.email) // 본인의 초대인지 확인
    .eq("accepted", false)
    .single();

  if (inviteError || !invitation) {
    console.log(inviteError);
    throw new Error("유효하지 않은 초대입니다.");
  }

  const { data: checkDup, error: checkDupError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", inviteId)
    .eq("user_id", user.id)
    .single();

  if (checkDupError) {
    throw new Error("error for checking dup.");
  }
  if (checkDup) {
    throw new Error("dup.");
  }

  // 3. 초대 수락 처리 (accepted = true)
  const { error: updateError } = await supabase
    .from("organization_invitations")
    .update({ accepted: true })
    .eq("organization_id", inviteId);

  if (updateError) {
    throw updateError;
  }

  // 4. organization_members에 삽입
  const { error: insertError } = await supabase.from("organization_members").insert({
    organization_id: invitation.organization_id,
    user_id: user.id,
    invited_by: invitation.invited_by,
    role: "member",
    organization_name: orgName,
    user_email: user.email,
  });

  if (insertError) {
    throw insertError;
  }

  return { success: true };
}
