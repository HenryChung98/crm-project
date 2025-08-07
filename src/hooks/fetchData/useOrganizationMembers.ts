// import { useEffect, useState } from "react";
// import type { Database } from "@/types/supabase";
// import { useAuth } from "@/contexts/AuthContext";
// type OrgMember = Database["public"]["Tables"]["organization_members"]["Row"];

// export const useOrganizationMembers = () => {
//   const { user, supabase } = useAuth();
//   const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
//   const [orgError, setOrgError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!user) return;
//     let isMounted = true;

//     const fetchMemberships = async () => {
//       const { data, error } = await supabase
//         .from("organization_members")
//         .select("*")
//         .eq("user_id", user.id);

//       if (isMounted) {
//         if (error) {
//           setOrgError(error.message);
//         } else {
//           setOrgMembers(data);
//         }
//       }
//     };
//     fetchMemberships();
//     return () => {
//       isMounted = false;
//     };
//   }, [user, supabase]);

//   return { orgMembers, orgError, isLoading: !orgMembers && !orgError };
// };
