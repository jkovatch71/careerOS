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
          job_description: string | null;
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
          job_description?: string | null;
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
          job_description?: string | null;
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
      resumes: {
        Row: {
          id: string;
          name: string;
          focus: string | null;
          file_url: string | null;
          is_master: boolean | null;
          notes: string | null;
          created_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          focus?: string | null;
          file_url?: string | null;
          is_master?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          focus?: string | null;
          file_url?: string | null;
          is_master?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      outreach: {
        Row: {
          id: string;
          opportunity_id: string | null;
          contact_id: string | null;
          channel: string | null;
          message: string | null;
          sent_at: string | null;
          response_at: string | null;
          outcome: string | null;
          created_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          opportunity_id?: string | null;
          contact_id?: string | null;
          channel?: string | null;
          message?: string | null;
          sent_at?: string | null;
          response_at?: string | null;
          outcome?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          opportunity_id?: string | null;
          contact_id?: string | null;
          channel?: string | null;
          message?: string | null;
          sent_at?: string | null;
          response_at?: string | null;
          outcome?: string | null;
          created_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "outreach_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "outreach_contact_id_fkey";
            columns: ["contact_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
        ];
      };
      follow_ups: {
        Row: {
          id: string;
          opportunity_id: string | null;
          contact_id: string | null;
          follow_up_type: string | null;
          due_at: string;
          completed_at: string | null;
          status: string;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          opportunity_id?: string | null;
          contact_id?: string | null;
          follow_up_type?: string | null;
          due_at: string;
          completed_at?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          opportunity_id?: string | null;
          contact_id?: string | null;
          follow_up_type?: string | null;
          due_at?: string;
          completed_at?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          { foreignKeyName: "follow_ups_opportunity_id_fkey"; columns: ["opportunity_id"]; isOneToOne: false; referencedRelation: "opportunities"; referencedColumns: ["id"] },
          { foreignKeyName: "follow_ups_contact_id_fkey"; columns: ["contact_id"]; isOneToOne: false; referencedRelation: "contacts"; referencedColumns: ["id"] },
        ];
      };
      ai_analyses: {
        Row: {
          id: string;
          user_id: string;
          opportunity_id: string;
          resume_id: string | null;
          analysis_type: string;
          input_hash: string;
          model: string;
          result: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opportunity_id: string;
          resume_id?: string | null;
          analysis_type: string;
          input_hash: string;
          model: string;
          result: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          opportunity_id?: string;
          resume_id?: string | null;
          analysis_type?: string;
          input_hash?: string;
          model?: string;
          result?: Json;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "ai_analyses_opportunity_id_fkey"; columns: ["opportunity_id"]; isOneToOne: false; referencedRelation: "opportunities"; referencedColumns: ["id"] },
          { foreignKeyName: "ai_analyses_resume_id_fkey"; columns: ["resume_id"]; isOneToOne: false; referencedRelation: "resumes"; referencedColumns: ["id"] },
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
export type Resume = Database["public"]["Tables"]["resumes"]["Row"];
export type Outreach = Database["public"]["Tables"]["outreach"]["Row"];
export type FollowUp = Database["public"]["Tables"]["follow_ups"]["Row"];
export type AiAnalysis = Database["public"]["Tables"]["ai_analyses"]["Row"];
