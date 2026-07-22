import { z } from "zod";

import { generateStructuredResponse } from "@/lib/ai/cloudflare";

export const companyResearchInputSchema = z.object({
  opportunityId: z.uuid("Select an opportunity."),
  sourceMaterial: z.string().trim().min(200, "Paste at least 200 characters of company source material.").max(30_000, "Source material is limited to 30,000 characters."),
});

const researchText = z.string().nullable().optional().transform((value) => value?.trim() || "Not specified in the supplied material");
const researchList = (limit: number) => z.array(z.string()).nullable().optional().transform((value) => (value ?? []).map((item) => item.trim()).filter(Boolean).slice(0, limit));

export const companyResearchSchema = z.object({
  company_snapshot: researchText,
  business_model: researchText,
  strategic_priorities: researchList(8),
  market_position: researchList(8),
  culture_signals: researchList(8),
  role_implications: researchList(8),
  risks_and_unknowns: researchList(8),
  interview_questions: researchList(10),
  talking_points: researchList(8),
  source_limitations: researchList(6),
});

export type CompanyResearch = z.infer<typeof companyResearchSchema>;

const stringArray = (maxItems: number) => ({ type: "array", items: { type: "string" }, maxItems });
const companyResearchJsonSchema = {
  type: "object",
  properties: {
    company_snapshot: { type: "string" },
    business_model: { type: "string" },
    strategic_priorities: stringArray(8),
    market_position: stringArray(8),
    culture_signals: stringArray(8),
    role_implications: stringArray(8),
    risks_and_unknowns: stringArray(8),
    interview_questions: stringArray(10),
    talking_points: stringArray(8),
    source_limitations: stringArray(6),
  },
  required: ["company_snapshot", "business_model", "strategic_priorities", "market_position", "culture_signals", "role_implications", "risks_and_unknowns", "interview_questions", "talking_points", "source_limitations"],
  additionalProperties: false,
};

export async function createCompanyResearch({ companyContext, roleTitle, sourceMaterial }: { companyContext: string; roleTitle: string; sourceMaterial: string }) {
  return generateStructuredResponse({
    system: "You are an executive company research analyst. Use only the supplied company record and source material. Clearly identify uncertainty, stale information, and missing evidence. Do not claim that information is current unless the supplied material establishes a date. Create practical interview preparation for the specified role.",
    prompt: `Create a grounded company research brief for this opportunity.\n\nROLE\n${roleTitle}\n\nCAREER OS COMPANY RECORD\n${companyContext}\n\nUSER-SUPPLIED SOURCE MATERIAL\n${sourceMaterial}`,
    jsonSchema: companyResearchJsonSchema,
    outputSchema: companyResearchSchema,
    maxTokens: 2200,
  });
}
