import { z } from "zod";

import { COMPANY_PRIORITIES, COMPANY_STATUSES, ORGANIZATION_TYPES, REMOTE_POLICIES } from "./constants";

const optionalText = z.string().trim().max(5000).transform((value) => value || null);

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
  score: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(100)])
    .transform((value) => (value === "" ? null : value)),
  status: z.enum(COMPANY_STATUSES.map((status) => status.value)),
  notes: optionalText,
});

export type CompanyInput = z.infer<typeof companySchema>;
