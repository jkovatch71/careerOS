"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { opportunitySchema } from "@/features/opportunities/schemas";
import { createClient } from "@/lib/supabase/server";

export type OpportunityActionState = { error?: string };

function valuesFromForm(formData: FormData) {
  return {
    company_id: formData.get("company_id"),
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
    .select("id")
    .eq("id", parsed.data.company_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!company) return { error: "Select a company you own." };

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
    .select("id")
    .eq("id", parsed.data.company_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!company) return { error: "Select a company you own." };

  const { error } = await supabase
    .from("opportunities")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", opportunityId)
    .eq("user_id", userId);
  if (error) return { error: "Career OS could not update this opportunity." };

  revalidatePath("/opportunities");
  redirect("/opportunities");
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
