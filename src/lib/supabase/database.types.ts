export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          website: string | null;
          industry: string | null;
          employee_range: string | null;
          remote_policy: string | null;
          priority: string | null;
          score: number | null;
          status: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          website?: string | null;
          industry?: string | null;
          employee_range?: string | null;
          remote_policy?: string | null;
          priority?: string | null;
          score?: number | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          website?: string | null;
          industry?: string | null;
          employee_range?: string | null;
          remote_policy?: string | null;
          priority?: string | null;
          score?: number | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Company = Database["public"]["Tables"]["companies"]["Row"];
