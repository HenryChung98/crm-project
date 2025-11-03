"use client";

import { acceptInvitation } from "./accept-invitation";
import { useTransition } from "react";
import { showSuccess, showError } from "@/shared-utils/feedback";

export const JoinOrganizationButton = ({
  orgId,
  orgName,
}: {
  orgId: string;
  orgName: string;
}) => {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await acceptInvitation(orgId, orgName);
            showSuccess("accepted!");
            window.location.href = `/orgs/${orgId}/dashboard`;
          } catch (err) {
            if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
              showSuccess("accepted!");
            } else {
              showError("Failed to join: " + (err as Error).message);
            }
          }
        })
      }
      className="border px-4 py-1 rounded bg-green-600 text-white disabled:opacity-50"
    >
      {isPending ? "Loading..." : "Join"}
    </button>
  );
};
