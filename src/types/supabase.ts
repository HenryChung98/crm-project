export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      auth_users: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          image: string | null;
          email_confirmed_at: string | null;
          created_at: string;
          last_sign_in_at: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          organization_id: string | null;
          email: string;
          first_name: string;
          last_name: string;
          role: string;
          phone: string | null;
          image: string | null;
          created_at: string;
          last_sign_in_at: string | null;
          phone_confirmed_at: string | null;
          email_confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: string;
          phone?: string | null;
          image?: string | null;
          created_at?: string;
          last_sign_in_at?: string | null;
          phone_confirmed_at?: string | null;
          email_confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          phone?: string | null;
          image?: string | null;
          created_at?: string;
          last_sign_in_at?: string | null;
          phone_confirmed_at?: string | null;
          email_confirmed_at?: string | null;
        };
        Relationships: [];
      };

      organizations: {
        Row: {
          id: string;
          organization_name: string;
          city: string;
          state_province: string;
          country: string; // ISO 3166-1 alpha-2 (e.g., 'US', 'KR')
          phone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_name: string;
          city: string;
          state_province?: string | null;
          country: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_name?: string;
          city?: string;
          state_province?: string | null;
          country?: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      // insert other tables here
    };
  };
}
