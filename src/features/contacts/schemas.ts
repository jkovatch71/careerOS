import { z } from "zod";

import { CONTACT_TYPES } from "./constants";

const nullableText = (max: number) =>
  z.string().trim().max(max).transform((value) => value || null);

export const contactSchema = z.object({
  company_id: z
    .union([z.literal(""), z.uuid()])
    .transform((value) => value || null),
  name: z.string().trim().min(1, "Contact name is required.").max(160),
  title: nullableText(160),
  email: z
    .union([z.literal(""), z.email("Enter a valid email address.")])
    .transform((value) => value || null),
  linkedin_url: z
    .union([z.literal(""), z.url("Enter a complete LinkedIn URL beginning with https://")])
    .transform((value) => value || null),
  contact_type: z.enum(CONTACT_TYPES.map((type) => type.value)),
  notes: nullableText(5000),
});
