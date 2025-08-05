import { SupabaseClient } from "@supabase/supabase-js";

export async function handleInvite(supabase: SupabaseClient, inviteCode: string, userId: string) {
  const { data: invite, error: inviteError } = await supabase
    .from("organization_invitations")
    .select("*")
    .eq("id", inviteCode)
    .maybeSingle();

  if (inviteError) throw new Error(inviteError.message);
  if (!invite) throw new Error("Invitation not found");

  // 유저 조직 연결
  await supabase.from("users").insert({
    id: userId,
    organization_id: invite.organization_id,
    role: "member",
  });

  // 초대 수락 처리
  await supabase.from("organization_invitations").update({ accepted: true }).eq("id", inviteCode);
}
