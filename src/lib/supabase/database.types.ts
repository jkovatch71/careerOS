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
          role_alignment_score: number | null;
          compensation_score: number | null;
          work_model_score: number | null;
          company_outlook_score: number | null;
          culture_interest_score: number | null;
          status: string | null;
          notes: string | null;
          organization_type: string;
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
          role_alignment_score?: number | null;
          compensation_score?: number | null;
          work_model_score?: number | null;
          company_outlook_score?: number | null;
          culture_interest_score?: number | null;
          status?: string | null;
          notes?: string | null;
          organization_type?: string;
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
          role_alignment_score?: number | null;
          compensation_score?: number | null;
          work_model_score?: number | null;
          company_outlook_score?: number | null;
          culture_interest_score?: number | null;
          status?: string | null;
          notes?: string | null;
          organization_type?: string;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          company_id: string | null;
          role_title: string;
          job_url: string | null;
          source: string | null;
          promoted_by_hirer: boolean | null;
          easy_apply: boolean | null;
          compensation: string | null;
          stage: string | null;
          fit_score: number | null;
          applied_at: string | null;
          next_action: string | null;
          next_action_at: string | null;
          primary_contact_id: string | null;
          recruiter_contact_id: string | null;
          recruiting_firm_id: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          role_title: string;
          job_url?: string | null;
          source?: string | null;
          promoted_by_hirer?: boolean | null;
          easy_apply?: boolean | null;
          compensation?: string | null;
          stage?: string | null;
          fit_score?: number | null;
          applied_at?: string | null;
          next_action?: string | null;
          next_action_at?: string | null;
          primary_contact_id?: string | null;
          recruiter_contact_id?: string | null;
          recruiting_firm_id?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          role_title?: string;
          job_url?: string | null;
          source?: string | null;
          promoted_by_hirer?: boolean | null;
          easy_apply?: boolean | null;
          compensation?: string | null;
          stage?: string | null;
          fit_score?: number | null;
          applied_at?: string | null;
          next_action?: string | null;
          next_action_at?: string | null;
          primary_contact_id?: string | null;
          recruiter_contact_id?: string | null;
          recruiting_firm_id?: string | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_recruiting_firm_id_fkey";
            columns: ["recruiting_firm_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_recruiter_contact_id_fkey";
            columns: ["recruiter_contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_primary_contact_id_fkey";
            columns: ["primary_contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          id: string;
          company_id: string | null;
          name: string;
          title: string | null;
          linkedin_url: string | null;
          email: string | null;
          contact_type: string | null;
          notes: string | null;
          created_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          name: string;
          title?: string | null;
          linkedin_url?: string | null;
          email?: string | null;
          contact_type?: string | null;
          notes?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string | null;
          name?: string;
          title?: string | null;
          linkedin_url?: string | null;
          email?: string | null;
          contact_type?: string | null;
          notes?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
