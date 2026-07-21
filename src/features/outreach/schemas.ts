import { z } from "zod";
import { OUTREACH_CHANNELS, OUTREACH_OUTCOMES } from "./constants";

const optionalId = z.union([z.literal(""), z.uuid()]).transform((value) => value || null);
const optionalDate = z.union([z.literal(""), z.coerce.date()]).transform((value) => value === "" ? null : value.toISOString());
const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || null);

export const outreachSchema = z.object({
  opportunity_id: optionalId,
  contact_id: optionalId,
  channel: z.union([z.literal(""), z.enum(OUTREACH_CHANNELS)]).transform((value) => value || null),
  message: optionalText(10000),
  sent_at: optionalDate,
  response_at: optionalDate,
  outcome: z.union([z.literal(""), z.enum(OUTREACH_OUTCOMES.map((outcome) => outcome.value))]).transform((value) => value || null),
});
