"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { acceptInvitation } from "@/app/(private)/orgs/invitation/_internal/accept-invitation";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      if (!loading) {
        if (user) {
          // read cookies that have been sent from sign up
          const orgId = document.cookie
            .split("; ")
            .find((row) => row.startsWith("pending_org_id="))
            ?.split("=")[1];
          const orgName = document.cookie
            .split("; ")
            .find((row) => row.startsWith("pending_org_name="))
            ?.split("=")[1];

          // if user is invited
          if (orgId && orgName) {
            await acceptInvitation(orgId, orgName);

            // delete cookies
            document.cookie = "pending_org_id=; path=/; max-age=0";
            document.cookie = "pending_org_name=; path=/; max-age=0";

            window.location.href = `/orgs/${orgId}/dashboard`;
            return;
          }
          // if sign up is successful, but fail to read cookies
          window.location.href = "/orgs";
        } else {
          router.replace("/auth/signin");
        }
      }
    };

    handleCallback();
  }, [user, loading, router, searchParams]);

  return <LoadingSpinner />;
}
