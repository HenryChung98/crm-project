// import { useEffect, useState } from "react";
// import { useAuth } from "@/contexts/AuthContext";
// import { Database } from "@/types/supabase";

// type OrgInvitation = Database["public"]["Tables"]["organization_members"]["Row"];

// export const useOrganizationInvitations = () => {
//   const { user, supabase } = useAuth();
//   const [orgInvitations, setOrgInvitations] = useState<OrgInvitation[]>([]);
//   const [orgError, setOrgError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!user) return;
//     let isMounted = true;

//     const fetchMemberships = async () => {
//       const { data, error } = await supabase
//         .from("organization_invitations")
//         .select("*")
//         .eq("email", user.email);

//       if (isMounted) {
//         if (error) {
//           setOrgError(error.message);
//         } else {
//           setOrgInvitations(data);
//         }
//       }
//     };
//     fetchMemberships();
//     return () => {
//       isMounted = false;
//     };
//   }, [user, supabase]);

//   return { orgInvitations, orgError, isLoading: !orgInvitations && !orgError };
// };
