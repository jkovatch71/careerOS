"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";

import {
  jobDescriptionInputSchema,
  parseJobDescription,
  type JobAnalysis,
} from "@/features/ai/job-description";
import {
  matchResumeToJob,
  resumeMatchInputSchema,
  type ResumeMatch,
} from "@/features/ai/resume-match";
import { CLOUDFLARE_AI_MODEL } from "@/lib/ai/cloudflare";
import { extractResumeText } from "@/lib/resumes/extract-text";
import { testCloudflareAiConnection } from "@/lib/ai/cloudflare";
import { createClient } from "@/lib/supabase/server";

export type AiConnectionState = {
  status?: "success" | "error";
  message?: string;
  model?: string;
};

export type JobParserState = {
  status?: "success" | "error";
  message?: string;
  analysis?: JobAnalysis;
};

export type ResumeMatchState = {
  status?: "success" | "error";
  message?: string;
  match?: ResumeMatch;
};

async function authenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !userId) redirect("/login");
  return { supabase, userId };
}

export async function testAiConnection(): Promise<AiConnectionState> {
  await authenticatedUser();

  try {
    const result = await testCloudflareAiConnection();
    return {
      status: "success",
      message: result.response || "Career OS connected",
      model: result.model,
    };
  } catch (connectionError) {
    return {
      status: "error",
      message:
        connectionError instanceof Error
          ? connectionError.message
          : "Career OS could not reach Cloudflare Workers AI.",
    };
  }
}

export async function parseOpportunityJobDescription(
  _: JobParserState,
  formData: FormData,
): Promise<JobParserState> {
  const parsed = jobDescriptionInputSchema.safeParse({
    opportunityId: formData.get("opportunity_id"),
    jobDescription: formData.get("job_description"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the job description." };
  }

  const { supabase, userId } = await authenticatedUser();
  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("id")
    .eq("id", parsed.data.opportunityId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!opportunity) return { status: "error", message: "Select an opportunity you own." };

  try {
    const analysis = await parseJobDescription(parsed.data.jobDescription);
    const inputHash = createHash("sha256").update(parsed.data.jobDescription).digest("hex");

    const { error: opportunityError } = await supabase
      .from("opportunities")
      .update({ job_description: parsed.data.jobDescription, updated_at: new Date().toISOString() })
      .eq("id", opportunity.id)
      .eq("user_id", userId);

    if (opportunityError) throw new Error("Career OS could not save the job description.");

    const { error: analysisError } = await supabase.from("ai_analyses").insert({
      user_id: userId,
      opportunity_id: opportunity.id,
      analysis_type: "job_description",
      input_hash: inputHash,
      model: CLOUDFLARE_AI_MODEL,
      result: analysis,
    });

    if (analysisError) throw new Error("Career OS could not save the AI analysis.");

    return { status: "success", message: "Analysis saved to this opportunity.", analysis };
  } catch (analysisError) {
    return {
      status: "error",
      message: analysisError instanceof Error ? analysisError.message : "Career OS could not analyze this job description.",
    };
  }
}

export async function analyzeResumeMatch(
  _: ResumeMatchState,
  formData: FormData,
): Promise<ResumeMatchState> {
  const parsed = resumeMatchInputSchema.safeParse({
    opportunityId: formData.get("opportunity_id"),
    resumeId: formData.get("resume_id"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Review the selections." };

  const { supabase, userId } = await authenticatedUser();
  const [{ data: opportunity }, { data: resume }] = await Promise.all([
    supabase.from("opportunities").select("id, job_description").eq("id", parsed.data.opportunityId).eq("user_id", userId).maybeSingle(),
    supabase.from("resumes").select("id, file_url").eq("id", parsed.data.resumeId).eq("user_id", userId).maybeSingle(),
  ]);

  if (!opportunity?.job_description) return { status: "error", message: "Analyze and save this opportunity's job description first." };
  if (!resume?.file_url) return { status: "error", message: "Select a resume with an uploaded file." };
  if (resume.file_url.startsWith("http")) return { status: "error", message: "External resume links cannot be analyzed. Upload the file to Career OS first." };

  try {
    const { data: file, error: downloadError } = await supabase.storage.from("resumes").download(resume.file_url);
    if (downloadError || !file) throw new Error("Career OS could not securely download this resume.");

    const resumeText = await extractResumeText(file, resume.file_url);
    const match = await matchResumeToJob({ resumeText, jobDescription: opportunity.job_description });
    const inputHash = createHash("sha256").update(`${opportunity.job_description}\n${resumeText}`).digest("hex");
    const { error: saveError } = await supabase.from("ai_analyses").insert({
      user_id: userId,
      opportunity_id: opportunity.id,
      resume_id: resume.id,
      analysis_type: "resume_match",
      input_hash: inputHash,
      model: CLOUDFLARE_AI_MODEL,
      result: match,
    });
    if (saveError) throw new Error("Career OS could not save the resume match.");

    return { status: "success", message: "Resume match saved.", match };
  } catch (matchError) {
    return { status: "error", message: matchError instanceof Error ? matchError.message : "Career OS could not match this resume." };
  }
}
