import { z } from "zod";

import { jobAnalysisSchema } from "@/features/ai/job-description";
import { generateStructuredResponse } from "@/lib/ai/cloudflare";

const optionalText = z
  .string()
  .transform((value) => value?.trim() || null);

const opportunityIntakeResponseSchema = jobAnalysisSchema.extend({
  company_name: optionalText,
  role_title: z.string().trim().min(1),
  source: z
    .union([
      z.literal(""),
      z.enum(["LinkedIn", "Company website", "Recruiter", "Referral", "Job board", "Other"]),
    ])
    .transform((value) => value || null),
  promoted_by_hirer: z.boolean().optional().default(false),
  easy_apply: z.boolean().optional().default(false),
});

const stringArray = (maxItems: number) => ({
  type: "array",
  items: { type: "string" },
  maxItems,
});

const opportunityIntakeJsonSchema = {
  type: "object",
  properties: {
    company_name: { type: "string" },
    role_title: { type: "string" },
    source: {
      type: "string",
      enum: ["", "LinkedIn", "Company website", "Recruiter", "Referral", "Job board", "Other"],
    },
    promoted_by_hirer: { type: "boolean" },
    easy_apply: { type: "boolean" },
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
    "company_name",
    "role_title",
    "source",
    "promoted_by_hirer",
    "easy_apply",
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

export async function createOpportunityIntakeDraft(jobDescription: string, jobUrl?: string) {
  const parsed = await generateStructuredResponse({
    system:
      "You extract a reviewable CRM draft from a job posting for an executive job seeker. Use only facts supported by the posting. company_name must be the actual hiring employer when stated, not the job board or recruiting platform. Use null or an empty string when information is absent. Set source only when it can be inferred from the supplied URL or posting. Never invent compensation, qualifications, or employer details.",
    prompt: [
      jobUrl ? `Posting URL: ${jobUrl}` : "Posting URL: Not supplied",
      "Job posting:",
      jobDescription,
    ].join("\n\n"),
    jsonSchema: opportunityIntakeJsonSchema,
    outputSchema: opportunityIntakeResponseSchema,
    maxTokens: 2200,
  });

  const {
    company_name,
    role_title,
    source,
    promoted_by_hirer,
    easy_apply,
    ...analysis
  } = parsed;

  return {
    draft: {
      companyName: company_name,
      roleTitle: role_title,
      source,
      promotedByHirer: promoted_by_hirer,
      easyApply: easy_apply,
      compensation: analysis.compensation === "Not specified" ? null : analysis.compensation,
    },
    analysis,
  };
}
