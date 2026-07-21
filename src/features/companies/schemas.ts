import { z } from "zod";

import { COMPANY_PRIORITIES, COMPANY_STATUSES, ORGANIZATION_TYPES, REMOTE_POLICIES } from "./constants";

const optionalText = z.string().trim().max(5000).transform((value) => value || null);
const scoreFactor = z
  .union([z.literal(""), z.coerce.number().int().min(0).max(20)])
  .transform((value) => (value === "" ? null : value));

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(160),
  organization_type: z.enum(ORGANIZATION_TYPES.map((type) => type.value)),
  website: z
    .union([z.literal(""), z.url("Enter a complete URL beginning with https://")])
    .transform((value) => value || null),
  industry: z.string().trim().max(120).transform((value) => value || null),
  employee_range: z.string().trim().max(80).transform((value) => value || null),
  remote_policy: z
    .union([z.literal(""), z.enum(REMOTE_POLICIES)])
    .transform((value) => value || null),
  priority: z.enum(COMPANY_PRIORITIES),
  role_alignment_score: scoreFactor,
  compensation_score: scoreFactor,
  work_model_score: scoreFactor,
  company_outlook_score: scoreFactor,
  culture_interest_score: scoreFactor,
  status: z.enum(COMPANY_STATUSES.map((status) => status.value)),
  notes: optionalText,
}).transform((company) => {
  const factors = [
    company.role_alignment_score,
    company.compensation_score,
    company.work_model_score,
    company.company_outlook_score,
    company.culture_interest_score,
  ];

  return {
    ...company,
    score: factors.every((factor): factor is number => factor !== null)
      ? factors.reduce((total, factor) => total + factor, 0)
      : null,
  };
});

export type CompanyInput = z.infer<typeof companySchema>;
