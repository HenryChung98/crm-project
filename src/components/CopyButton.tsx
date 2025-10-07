"use client";
import { showSuccess, showError } from "@/utils/feedback";
import { Button } from "./ui/Button";
import { useState } from "react";
import { usePlanByOrg } from "@/hooks/tanstack/usePlan";

export function CopyButton({
  text,
  label,
  currentOrgId,
  basicRequired = false,
  premiumRequired = false,
}: {
  text: string;
  label: string;
  currentOrgId: string;
  basicRequired?: boolean;
  premiumRequired?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { data: orgPlanData, isLoading: orgPlanLoading } = usePlanByOrg(currentOrgId);

  const handleCopy = async () => {
    try {
      if ((basicRequired || premiumRequired) && orgPlanLoading) {
        showError("Please wait for plan to load");
        return;
      }
      if (basicRequired && orgPlanData?.plans.name !== "basic") {
        throw new Error("You need to be on the basic plan to copy this link");
      }
      if (premiumRequired && orgPlanData?.plans.name !== "premium") {
        throw new Error("You need to be on the premium plan to copy this link");
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess("Link is successfully copied");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to copy");
    }
  };

  return (
    <Button onClick={handleCopy} disabled={copied}>
      {copied ? "Copied!" : label}
    </Button>
  );
}
