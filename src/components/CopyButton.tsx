"use client";
import { showSuccess, showError } from "@/utils/feedback";
import { Button } from "./ui/Button";
import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showSuccess("Link is successfully copied");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showError("Failed to copy");
    }
  };

  return (
    <Button onClick={handleCopy} disabled={copied}>
      {copied ? "Copied!" : label}
    </Button>
  );
}
