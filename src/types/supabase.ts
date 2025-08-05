export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          organization_id: string | null;
          role: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          role: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          role?: string;
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
