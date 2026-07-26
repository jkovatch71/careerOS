"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { jobAnalysisSchema, type JobAnalysis } from "@/features/ai/job-description";
import { createOpportunityIntakeDraft } from "@/features/opportunities/opportunity-intake";
import { opportunitySchema } from "@/features/opportunities/schemas";
import { CLOUDFLARE_AI_MODEL } from "@/lib/ai/cloudflare";
import { fetchJobPostingText } from "@/lib/job-postings/fetch-posting";
import { createClient } from "@/lib/supabase/server";

export type OpportunityActionState = { error?: string };
export type OpportunityIntakeState = {
  status?: "error" | "success";
  message?: string;
  draft?: {
    companyId: string | null;
    companyName: string | null;
    roleTitle: string;
    jobUrl: string | null;
    jobDescription: string;
    source: string | null;
    promotedByHirer: boolean;
    easyApply: boolean;
    compensation: string | null;
    analysis: JobAnalysis;
  };
};

function opportunityInsertError(code?: string) {
  switch (code) {
    case "42501":
      return "Career OS could not create this opportunity because its ownership policy rejected the save.";
    case "23503":
      return "Career OS could not create this opportunity because a selected company or contact is no longer available.";
    case "23514":
      return "Career OS could not create this opportunity because one of the extracted values is not allowed.";
    case "23502":
      return "Career OS could not create this opportunity because a required database value is missing.";
    default:
      return `Career OS could not create this opportunity${code ? ` (database code ${code})` : ""}.`;
  }
}

function valuesFromForm(formData: FormData) {
  return {
    company_id: formData.get("company_id"),
    primary_contact_id: formData.get("primary_contact_id") ?? "",
    recruiting_firm_id: formData.get("recruiting_firm_id") ?? "",
    recruiter_contact_id: formData.get("recruiter_contact_id") ?? "",
    role_title: formData.get("role_title"),
    job_url: formData.get("job_url"),
    job_description: formData.get("job_description"),
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

const intakeInputSchema = z
  .object({
    inputMode: z.enum(["url", "paste"]),
    jobUrl: z
      .union([z.literal(""), z.url("Enter a complete job-posting URL.")])
      .transform((value) => value || null),
    jobDescription: z.string().trim().max(30_000),
  })
  .superRefine((value, context) => {
    if (value.inputMode === "url" && !value.jobUrl) {
      context.addIssue({ code: "custom", path: ["jobUrl"], message: "Enter a job-posting URL." });
    }
    if (value.inputMode === "paste" && value.jobDescription.length < 200) {
      context.addIssue({
        code: "custom",
        path: ["jobDescription"],
        message: "Paste at least 200 characters of the job posting.",
      });
    }
  });

export async function analyzeOpportunityIntake(
  _: OpportunityIntakeState,
  formData: FormData,
): Promise<OpportunityIntakeState> {
  const parsed = intakeInputSchema.safeParse({
    inputMode: formData.get("input_mode"),
    jobUrl: formData.get("job_url"),
    jobDescription: formData.get("job_description"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Review the job-posting details.",
    };
  }

  const { supabase, userId } = await authenticatedUser();

  try {
    const jobDescription =
      parsed.data.inputMode === "url" && parsed.data.jobUrl
        ? await fetchJobPostingText(parsed.data.jobUrl)
        : parsed.data.jobDescription;
    const { draft, analysis } = await createOpportunityIntakeDraft(
      jobDescription,
      parsed.data.jobUrl ?? undefined,
    );
    const { data: companies } = await supabase
      .from("companies")
      .select("id, name, organization_type")
      .eq("user_id", userId);
    const normalizedCompanyName = draft.companyName?.trim().toLocaleLowerCase();
    const matchingCompany = (companies ?? []).find(
      (company) =>
        ["employer", "both"].includes(company.organization_type) &&
        company.name.trim().toLocaleLowerCase() === normalizedCompanyName,
    );

    return {
      status: "success",
      message: "Review the extracted details before creating the opportunity.",
      draft: {
        companyId: matchingCompany?.id ?? null,
        companyName: draft.companyName,
        roleTitle: draft.roleTitle,
        jobUrl: parsed.data.jobUrl,
        jobDescription,
        source: draft.source,
        promotedByHirer: draft.promotedByHirer,
        easyApply: draft.easyApply,
        compensation: draft.compensation,
        analysis,
      },
    };
  } catch (error) {
    const fallbackMessage =
      parsed.data.inputMode === "url"
        ? "Career OS could not read that posting. Switch to Paste posting and copy the full description."
        : "Career OS could not analyze that posting. Please review the text and try again.";
    return {
      status: "error",
      message: error instanceof Error && !error.message.includes("fetch")
        ? `${error.message} ${parsed.data.inputMode === "url" ? "You can paste the posting instead." : ""}`.trim()
        : fallbackMessage,
    };
  }
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
  let companyId = parsed.data.company_id;
  if (!companyId && formData.get("create_company") === "on") {
    const companyName = z.string().trim().min(1).max(180).safeParse(formData.get("new_company_name"));
    if (!companyName.success) return { error: "Review the suggested company name." };

    const { data: existingCompanies } = await supabase
      .from("companies")
      .select("id, name, organization_type")
      .eq("user_id", userId);
    const existingCompany = (existingCompanies ?? []).find(
      (company) =>
        ["employer", "both"].includes(company.organization_type) &&
        company.name.trim().toLocaleLowerCase() === companyName.data.toLocaleLowerCase(),
    );

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      const newCompanyId = randomUUID();
      const { error: companyError } = await supabase
        .from("companies")
        .insert({
          id: newCompanyId,
          name: companyName.data,
          organization_type: "employer",
          user_id: userId,
        });
      if (companyError) {
        return { error: "Career OS could not create the suggested company." };
      }
      companyId = newCompanyId;
    }
  }

  if (companyId) {
    const { data: company } = await supabase
      .from("companies")
      .select("id, organization_type")
      .eq("id", companyId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!company || !["employer", "both"].includes(company.organization_type)) {
      return { error: "Select an employer organization you own." };
    }
  }

  if (parsed.data.primary_contact_id) {
    const { data: primaryContact } = await supabase
      .from("contacts")
      .select("id, company_id")
      .eq("id", parsed.data.primary_contact_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!companyId || !primaryContact || primaryContact.company_id !== companyId) {
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

  const opportunityId = randomUUID();
  const { error } = await supabase.from("opportunities").insert({
    ...parsed.data,
    id: opportunityId,
    company_id: companyId,
    user_id: userId,
  });
  if (error) {
    console.error("Opportunity insert failed", {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });
    return { error: opportunityInsertError(error.code) };
  }

  const analysisJson = formData.get("analysis_json");
  if (typeof analysisJson === "string" && analysisJson) {
    try {
      const analysis = jobAnalysisSchema.parse(JSON.parse(analysisJson));
      if (parsed.data.job_description) {
        await supabase.from("ai_analyses").insert({
          user_id: userId,
          opportunity_id: opportunityId,
          analysis_type: "job_description",
          input_hash: createHash("sha256").update(parsed.data.job_description).digest("hex"),
          model: CLOUDFLARE_AI_MODEL,
          result: analysis,
        });
      }
    } catch {
      // The opportunity is still valid when optional analysis metadata cannot be saved.
    }
  }

  revalidatePath("/opportunities");
  revalidatePath("/companies");
  redirect(`/opportunities/${opportunityId}`);
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
  if (parsed.data.company_id) {
    const { data: company } = await supabase
      .from("companies")
      .select("id, organization_type")
      .eq("id", parsed.data.company_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!company || !["employer", "both"].includes(company.organization_type)) {
      return { error: "Select an employer organization you own." };
    }
  }

  if (parsed.data.primary_contact_id) {
    const { data: primaryContact } = await supabase
      .from("contacts")
      .select("id, company_id")
      .eq("id", parsed.data.primary_contact_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!parsed.data.company_id || !primaryContact || primaryContact.company_id !== parsed.data.company_id) {
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
