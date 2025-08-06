import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { Database } from "@/types/supabase";

type OrgInvitation = Database["public"]["Tables"]["organization_members"]["Row"];

export const useOrganizations = () => {
  const { user, supabase } = useAuth();
  const [organizations, setOrganizations] = useState<OrgInvitation[]>([]);
  const [orgError, setOrgError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const fetchMemberships = async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("email", user.email);

      if (isMounted) {
        if (error) {
          setOrgError(error.message);
        } else {
          setOrganizations(data);
        }
      }
    };
    fetchMemberships();
    return () => {
      isMounted = false;
    };
  }, [user, supabase]);

  return { organizations, orgError, isLoading: !organizations && !orgError };
};
