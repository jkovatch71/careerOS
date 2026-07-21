"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";

import {
  jobDescriptionInputSchema,
  parseJobDescription,
  type JobAnalysis,
} from "@/features/ai/job-description";
import { CLOUDFLARE_AI_MODEL } from "@/lib/ai/cloudflare";
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
  const intent = formData.get("intent");
  if (intent === "test-storage") {
    const opportunityId = formData.get("opportunity_id");
    if (typeof opportunityId !== "string" || !opportunityId) {
      return { status: "error", message: "Select an opportunity before testing storage." };
    }

    const { supabase, userId } = await authenticatedUser();
    const { data: opportunity } = await supabase
      .from("opportunities")
      .select("id")
      .eq("id", opportunityId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!opportunity) return { status: "error", message: "Select an opportunity you own." };

    const { data: diagnostic, error: diagnosticError } = await supabase
      .from("ai_analyses")
      .insert({
        user_id: userId,
        opportunity_id: opportunity.id,
        analysis_type: "job_description",
        input_hash: "storage-diagnostic",
        model: "storage-diagnostic",
        result: { diagnostic: true },
      })
      .select("id")
      .single();

    if (diagnosticError) {
      return {
        status: "error",
        message: `Database error ${diagnosticError.code}: ${diagnosticError.message}`,
      };
    }

    await supabase.from("ai_analyses").delete().eq("id", diagnostic.id).eq("user_id", userId);
    return { status: "success", message: "Analysis storage is working. The diagnostic row was removed." };
  }

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
