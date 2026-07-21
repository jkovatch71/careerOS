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

export const jobAnalysisSchema = z.object({
  executive_summary: z.string().min(1),
  seniority: z.string().min(1),
  responsibilities: z.array(z.string()).max(10),
  required_qualifications: z.array(z.string()).max(10),
  preferred_qualifications: z.array(z.string()).max(10),
  skills: z.array(z.string()).max(15),
  leadership_signals: z.array(z.string()).max(10),
  keywords: z.array(z.string()).max(20),
  compensation: z.string(),
});

export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;

const stringArray = { type: "array", items: { type: "string" } };
const jobAnalysisJsonSchema = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    seniority: { type: "string" },
    responsibilities: stringArray,
    required_qualifications: stringArray,
    preferred_qualifications: stringArray,
    skills: stringArray,
    leadership_signals: stringArray,
    keywords: stringArray,
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
