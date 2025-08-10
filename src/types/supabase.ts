export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          city: string;
          state_province: string | null;
          country: string; // ISO 3166-1 alpha-2 (e.g., 'US', 'KR')
          created_by: string;
          created_at: string;
        };
        Insert: {
          name: string;
          country: string;
          state_province?: string | null;
          city: string;
          created_by: string;
          phone?: string | null;
          email?: string | null;
        };
        Update: {
          organization_name?: string;
          city?: string;
          state_province?: string | null;
          country?: string;
          phone?: string | null;
          email?: string | null;
        };
        Relationships: [];
      };

      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          organization_name: string;
          user_id: string;
          invited_by: string;
          role: string;
          created_at: string;
          user_email: string;
        };
        Insert: {
          organization_id: string;
          organization_name: string;
          user_id: string;
          role: string;
          created_at: string;
          invited_by?: string | null;
          user_email: string;
        };
        Update: {
          role: string;
          user_email: string;
        };
        Relationships: [];
      };
      organization_invitations: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          accepted: boolean;
          invited_by: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          email: string;
          accepted: boolean;
          invited_by: string;
          created_at: string;
          expires_at: string;
        };
        Update: {
          accepted?: boolean | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
    };
  };
}
