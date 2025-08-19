"use client";

import { updateCustomerStatus } from "./component-actions/update-customer-status";
import { useTransition } from "react";

// ui
import { Button } from "./ui/Button";
import { showSuccess, showError } from "@/utils/feedback";

export default function UpdateCustomerStatusButton({ orgId }: { orgId: string | undefined }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          try {
            await updateCustomerStatus(orgId);
            showSuccess("updated!");
          } catch (err) {
            showError("Failed to join: " + (err as Error).message);
          }
        })
      }
    >
      {isPending ? "Loading..." : "update"}
    </Button>
  );
}



