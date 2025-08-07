"use client";

import { acceptInvitation } from "../(afterSignin)/dashboard/actions/accept-invitation";
import { useTransition } from "react";

export default function JoinOrgButton({
  inviteId,
  orgName,
}: {
  inviteId: string;
  orgName: string | undefined;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await acceptInvitation(inviteId, orgName);
            alert("초대 수락 완료!");
            // TODO: 상태 새로고침 or 라우팅
          } catch (err) {
            alert("초대 수락 실패: " + (err as Error).message);
          }
        })
      }
      className="border px-4 py-1 rounded bg-green-600 text-white disabled:opacity-50"
    >
      {isPending ? "가입 중..." : "Join"}
    </button>
  );
}
