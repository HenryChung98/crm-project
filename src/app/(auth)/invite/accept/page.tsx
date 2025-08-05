"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { acceptInviteAction } from "./route";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [status, setStatus] = useState<string>("loading");
  const router = useRouter();
  useEffect(() => {
    if (code) {
      acceptInvite(code);
    } else {
      router.push("/signup");
    }
  }, [code, router]);

  const acceptInvite = async (inviteCode: string) => {
    const res = await acceptInviteAction(inviteCode);
    if (res.error) {
      setStatus(res.error);
    } else {
      setStatus("success");
    }
  };

  return (
    <div>
      {status === "loading" && <p>Processing invitation...</p>}
      {status === "success" && <p>Successfully joined organization!</p>}
      {status === "error" && <p>Invalid or expired invitation.</p>}
    </div>
  );
}
