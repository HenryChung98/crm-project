"use client";

import { acceptInvitation } from "./component-actions/accept-invitation";
import { useTransition } from "react";

import { showSuccess, showError } from "@/utils/feedback";

export default function JoinOrganizationButton({
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
            showSuccess("accepted!");
          } catch (err) {
            showError("Failed to join: " + (err as Error).message);
          }
        })
      }
      className="border px-4 py-1 rounded bg-green-600 text-white disabled:opacity-50"
    >
      {isPending ? "Loading..." : "Join"}
    </button>
  );
}
