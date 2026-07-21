import { z } from "zod";

import { generateStructuredResponse } from "@/lib/ai/cloudflare";

export const jobDescriptionInputSchema = z.object({
  opportunityId: z.uuid("Select an opportunity."),
  jobDescription: z
    .string()
    .trim()
    .min(200, "Paste at least 200 characters of the job description.")
    .max(30_000, "Job descriptions are limited to 30,000 characters."),
});

const analysisText = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value?.trim() || "Not specified");

const analysisList = (limit: number) =>
  z
    .array(z.string())
    .nullable()
    .optional()
    .transform((value) => (value ?? []).map((item) => item.trim()).filter(Boolean).slice(0, limit));

export const jobAnalysisSchema = z.object({
  executive_summary: analysisText,
  seniority: analysisText,
  responsibilities: analysisList(10),
  required_qualifications: analysisList(10),
  preferred_qualifications: analysisList(10),
  skills: analysisList(15),
  leadership_signals: analysisList(10),
  keywords: analysisList(20),
  compensation: analysisText,
});

export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;

const stringArray = (maxItems: number) => ({
  type: "array",
  items: { type: "string" },
  maxItems,
});
const jobAnalysisJsonSchema = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    seniority: { type: "string" },
    responsibilities: stringArray(10),
    required_qualifications: stringArray(10),
    preferred_qualifications: stringArray(10),
    skills: stringArray(15),
    leadership_signals: stringArray(10),
    keywords: stringArray(20),
    compensation: { type: "string" },
  },
  required: [
    "executive_summary",
    "seniority",
    "responsibilities",
    "required_qualifications",
    "preferred_qualifications",
    "skills",
    "leadership_signals",
    "keywords",
    "compensation",
  ],
  additionalProperties: false,
};

export async function parseJobDescription(jobDescription: string) {
  return generateStructuredResponse({
    system:
      "You are an executive career analyst. Extract only information supported by the provided job description. Keep list items concise. Use empty arrays or an empty string when information is absent. Do not invent qualifications or compensation.",
    prompt: `Analyze this job description for an executive job seeker:\n\n${jobDescription}`,
    jsonSchema: jobAnalysisJsonSchema,
    outputSchema: jobAnalysisSchema,
  });
}
