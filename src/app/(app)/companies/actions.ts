"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { companySchema } from "@/features/companies/schemas";
import { createClient } from "@/lib/supabase/server";

export type CompanyActionState = { error?: string };

function valuesFromForm(formData: FormData) {
  return {
    name: formData.get("name"),
    organization_type: formData.get("organization_type"),
    website: formData.get("website"),
    industry: formData.get("industry"),
    employee_range: formData.get("employee_range"),
    remote_policy: formData.get("remote_policy"),
    priority: formData.get("priority"),
    role_alignment_score: formData.get("role_alignment_score"),
    compensation_score: formData.get("compensation_score"),
    work_model_score: formData.get("work_model_score"),
    company_outlook_score: formData.get("company_outlook_score"),
    culture_interest_score: formData.get("culture_interest_score"),
    status: formData.get("status"),
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

export async function createCompany(
  _: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const parsed = companySchema.safeParse(valuesFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Review the company details." };
  }

  const { supabase, userId } = await authenticatedUser();
  const { error } = await supabase.from("companies").insert({
    ...parsed.data,
    user_id: userId,
  });

  if (error) return { error: "Career OS could not create this company." };

  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompany(
  companyId: string,
  _: CompanyActionState,
  formData: FormData,
): Promise<CompanyActionState> {
  const parsed = companySchema.safeParse(valuesFromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Review the company details." };
  }

  const { supabase, userId } = await authenticatedUser();
  const { error } = await supabase
    .from("companies")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", companyId)
    .eq("user_id", userId);

  if (error) return { error: "Career OS could not update this company." };

  revalidatePath("/companies");
  redirect("/companies");
}

export async function deleteCompany(companyId: string) {
  const { supabase, userId } = await authenticatedUser();
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId)
    .eq("user_id", userId);

  if (error) redirect(`/companies/${companyId}/edit?error=delete`);

  revalidatePath("/companies");
  redirect("/companies");
}
