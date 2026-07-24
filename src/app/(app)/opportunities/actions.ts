"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { opportunitySchema } from "@/features/opportunities/schemas";
import { createClient } from "@/lib/supabase/server";

export type OpportunityActionState = { error?: string };

function valuesFromForm(formData: FormData) {
  return {
    company_id: formData.get("company_id"),
    primary_contact_id: formData.get("primary_contact_id") ?? "",
    recruiting_firm_id: formData.get("recruiting_firm_id") ?? "",
    recruiter_contact_id: formData.get("recruiter_contact_id") ?? "",
    role_title: formData.get("role_title"),
    job_url: formData.get("job_url"),
    source: formData.get("source"),
    promoted_by_hirer: formData.get("promoted_by_hirer") === "on",
    easy_apply: formData.get("easy_apply") === "on",
    compensation: formData.get("compensation"),
    stage: formData.get("stage"),
    fit_score: formData.get("fit_score"),
    applied_at: formData.get("applied_at"),
    next_action: formData.get("next_action"),
    next_action_at: formData.get("next_action_at"),
    notes: formData.get("notes"),
  };
}

async function authenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !userId) redirect("/login");
  return { supabase, userId };
}

export async function createOpportunity(
  _: OpportunityActionState,
  formData: FormData,
): Promise<OpportunityActionState> {
  const parsed = opportunitySchema.safeParse(valuesFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Review the opportunity details." };
  }

  const { supabase, userId } = await authenticatedUser();
  const { data: company } = await supabase
    .from("companies")
    .select("id, organization_type")
    .eq("id", parsed.data.company_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!company || !["employer", "both"].includes(company.organization_type)) {
    return { error: "Select an employer organization you own." };
  }

  if (parsed.data.primary_contact_id) {
    const { data: primaryContact } = await supabase
      .from("contacts")
      .select("id, company_id")
      .eq("id", parsed.data.primary_contact_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!primaryContact || primaryContact.company_id !== parsed.data.company_id) {
      return { error: "Select a primary contact associated with this employer." };
    }
  }

  if (parsed.data.recruiting_firm_id) {
    const { data: firm } = await supabase
      .from("companies")
      .select("id, organization_type")
      .eq("id", parsed.data.recruiting_firm_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!firm || !["recruiting_firm", "both"].includes(firm.organization_type)) {
      return { error: "Select a recruiting firm you own." };
    }
  }

  if (parsed.data.recruiter_contact_id) {
    const { data: recruiter } = await supabase
      .from("contacts")
      .select("id, company_id")
      .eq("id", parsed.data.recruiter_contact_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!recruiter || (parsed.data.recruiting_firm_id && recruiter.company_id !== parsed.data.recruiting_firm_id)) {
      return { error: "Select a recruiter associated with this firm." };
    }
  }

  const { error } = await supabase.from("opportunities").insert({
    ...parsed.data,
    user_id: userId,
  });
  if (error) return { error: "Career OS could not create this opportunity." };

  revalidatePath("/opportunities");
  redirect("/opportunities");
}

export async function updateOpportunity(
  opportunityId: string,
  _: OpportunityActionState,
  formData: FormData,
): Promise<OpportunityActionState> {
  const parsed = opportunitySchema.safeParse(valuesFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Review the opportunity details." };
  }

  const { supabase, userId } = await authenticatedUser();
  const { data: company } = await supabase
    .from("companies")
    .select("id, organization_type")
    .eq("id", parsed.data.company_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!company || !["employer", "both"].includes(company.organization_type)) {
    return { error: "Select an employer organization you own." };
  }

  if (parsed.data.primary_contact_id) {
    const { data: primaryContact } = await supabase
      .from("contacts")
      .select("id, company_id")
      .eq("id", parsed.data.primary_contact_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!primaryContact || primaryContact.company_id !== parsed.data.company_id) {
      return { error: "Select a primary contact associated with this employer." };
    }
  }

  if (parsed.data.recruiting_firm_id) {
    const { data: firm } = await supabase
      .from("companies")
      .select("id, organization_type")
      .eq("id", parsed.data.recruiting_firm_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!firm || !["recruiting_firm", "both"].includes(firm.organization_type)) {
      return { error: "Select a recruiting firm you own." };
    }
  }

  if (parsed.data.recruiter_contact_id) {
    const { data: recruiter } = await supabase
      .from("contacts")
      .select("id, company_id")
      .eq("id", parsed.data.recruiter_contact_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!recruiter || (parsed.data.recruiting_firm_id && recruiter.company_id !== parsed.data.recruiting_firm_id)) {
      return { error: "Select a recruiter associated with this firm." };
    }
  }

  const { error } = await supabase
    .from("opportunities")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", opportunityId)
    .eq("user_id", userId);
  if (error) return { error: "Career OS could not update this opportunity." };

  revalidatePath("/opportunities");
  revalidatePath(`/opportunities/${opportunityId}`);
  redirect(`/opportunities/${opportunityId}`);
}

export async function deleteOpportunity(opportunityId: string) {
  const { supabase, userId } = await authenticatedUser();
  const { error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", opportunityId)
    .eq("user_id", userId);
  if (error) redirect(`/opportunities/${opportunityId}/edit?error=delete`);

  revalidatePath("/opportunities");
  redirect("/opportunities");
}
