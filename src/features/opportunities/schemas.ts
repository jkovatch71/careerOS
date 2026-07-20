import { z } from "zod";

import { OPPORTUNITY_SOURCES, OPPORTUNITY_STAGES } from "./constants";

const nullableText = (max: number) =>
  z.string().trim().max(max).transform((value) => value || null);

const nullableDate = z
  .union([z.literal(""), z.coerce.date()])
  .transform((value) => (value === "" ? null : value.toISOString()));

export const opportunitySchema = z.object({
  company_id: z.uuid("Select a company."),
  recruiting_firm_id: z
    .union([z.literal(""), z.uuid()])
    .transform((value) => value || null),
  recruiter_contact_id: z
    .union([z.literal(""), z.uuid()])
    .transform((value) => value || null),
  role_title: z.string().trim().min(1, "Role title is required.").max(180),
  job_url: z
    .union([z.literal(""), z.url("Enter a complete URL beginning with https://")])
    .transform((value) => value || null),
  source: z
    .union([z.literal(""), z.enum(OPPORTUNITY_SOURCES)])
    .transform((value) => value || null),
  promoted_by_hirer: z.boolean(),
  easy_apply: z.boolean(),
  compensation: nullableText(160),
  stage: z.enum(OPPORTUNITY_STAGES.map((stage) => stage.value)),
  fit_score: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(100)])
    .transform((value) => (value === "" ? null : value)),
  applied_at: nullableDate,
  next_action: nullableText(240),
  next_action_at: nullableDate,
  notes: nullableText(5000),
});
