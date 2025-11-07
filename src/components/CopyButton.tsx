"use client";
import { showSuccess, showError } from "@/components/feedback";
import { Button } from "./ui/Button";
import { useState } from "react";
// import { usePlan } from "@/shared-hooks/usePlan";

export function CopyButton({
  text,
  label,
  currentOrgPlan,
  basicPlanRequired = false,
  premiumPlanRequired = false,
}: {
  text: string;
  label: string;
  currentOrgPlan: string | undefined;
  basicPlanRequired?: boolean;
  premiumPlanRequired?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (basicPlanRequired && currentOrgPlan !== "basic" && currentOrgPlan !== "premium") {
        throw new Error("You need to be on the basic plan to copy this link");
      }
      if (premiumPlanRequired && currentOrgPlan !== "premium") {
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
