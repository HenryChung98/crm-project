// export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// export interface Database {
//   public: {
//     Tables: {
//       organizations: {
//         Row: {
//           id: string;
//           name: string;
//           email: string | null;
//           phone: string | null;
//           city: string;
//           state_province: string | null;
//           country: string; // ISO 3166-1 alpha-2 (e.g., 'US', 'KR')
//           created_by: string;
//           created_at: string;
//         };
//         Insert: {
//           name: string;
//           country: string;
//           state_province?: string | null;
//           city: string;
//           created_by: string;
//           phone?: string | null;
//           email?: string | null;
//         };
//         Update: {
//           organization_name?: string;
//           city?: string;
//           state_province?: string | null;
//           country?: string;
//           phone?: string | null;
//           email?: string | null;
//         };
//         Relationships: [];
//       };

//       customers: {
//         Row: {
//           id: string;
//           organization_id: string;
//           first_name: string;
//           last_name: string;
//           email: string;
//           phone: string;
//           status: string;
//           tag: string;
//           created_at: string;
//           updated_at: string;
//           last_contacted_at: string;
//           source: string;
//           note: string;
//         };
//         Insert: {
//           organization_id: string;
//           first_name: string;
//           last_name: string;
//           email?: string | null;
//           phone?: string | null;
//           status: string;
//           tag: string;
//           updated_at?: string | null;
//           last_contacted_at?: string | null;
//           source: string;
//           note?: string | null;
//         };
//         Update: {
//           first_name?: string | null;
//           last_name?: string | null;
//           email?: string | null;
//           phone?: string | null;
//           status?: string | null;
//           tag?: string | null;
//           updated_at?: string | null;
//           last_contacted_at?: string | null;
//           source?: string | null;
//           note?: string | null;
//         };
//         Relationships: [];
//       };
//       customer_logs: {
//         Row: {
//           id: string;
//           customer_id: string;
//           action: string;
//           changed_data: Json;
//           performed_at: string;
//           performed_by: string;
//           organization_members?: {
//             user_email: string;
//           };
//         };
//         Insert: {
//           customer_id: string;
//           action: string;
//           changed_data: Json;
//           performed_by: string;
//         };
//         Relationships: [];
//       };
//     };
//   };
// }
