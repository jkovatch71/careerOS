import { z } from "zod";

import { generateStructuredResponse } from "@/lib/ai/cloudflare";

export const resumeMatchInputSchema = z.object({
  opportunityId: z.uuid("Select an opportunity."),
  resumeId: z.uuid("Select a resume."),
});

const matchText = z.string().nullable().optional().transform((value) => value?.trim() || "Not specified");
const matchList = (limit: number) => z.array(z.string()).nullable().optional().transform((value) => (value ?? []).map((item) => item.trim()).filter(Boolean).slice(0, limit));

export const resumeMatchSchema = z.object({
  match_score: z.coerce.number().min(0).max(100),
  verdict: matchText,
  strongest_matches: matchList(10),
  evidence: matchList(10),
  gaps: matchList(10),
  matched_keywords: matchList(20),
  missing_keywords: matchList(20),
  resume_recommendations: matchList(10),
  interview_focus: matchList(10),
});

export type ResumeMatch = z.infer<typeof resumeMatchSchema>;

const stringArray = (maxItems: number) => ({ type: "array", items: { type: "string" }, maxItems });
const resumeMatchJsonSchema = {
  type: "object",
  properties: {
    match_score: { type: "number", minimum: 0, maximum: 100 },
    verdict: { type: "string" },
    strongest_matches: stringArray(10),
    evidence: stringArray(10),
    gaps: stringArray(10),
    matched_keywords: stringArray(20),
    missing_keywords: stringArray(20),
    resume_recommendations: stringArray(10),
    interview_focus: stringArray(10),
  },
  required: ["match_score", "verdict", "strongest_matches", "evidence", "gaps", "matched_keywords", "missing_keywords", "resume_recommendations", "interview_focus"],
  additionalProperties: false,
};

export async function matchResumeToJob({ resumeText, jobDescription }: { resumeText: string; jobDescription: string }) {
  return generateStructuredResponse({
    system: "You are an exacting executive resume strategist. Compare only evidence present in the resume against requirements present in the job description. Never invent experience. Distinguish a true gap from wording that is merely absent. Recommendations must be truthful and must not suggest adding unsupported claims.",
    prompt: `Compare the resume to the job description. Score the evidence-based match from 0 to 100. Cite concise resume evidence and identify truthful improvements.\n\nJOB DESCRIPTION\n${jobDescription.slice(0, 24_000)}\n\nRESUME\n${resumeText.slice(0, 24_000)}`,
    jsonSchema: resumeMatchJsonSchema,
    outputSchema: resumeMatchSchema,
    maxTokens: 2200,
  });
}
