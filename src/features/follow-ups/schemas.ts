import { z } from "zod";
import { FOLLOW_UP_TYPES } from "./constants";

const optionalId = z.union([z.literal(""), z.uuid()]).transform((value) => value || null);

export const followUpSchema = z.object({
  opportunity_id: optionalId,
  contact_id: optionalId,
  follow_up_type: z.enum(FOLLOW_UP_TYPES),
  due_at: z.coerce.date().transform((value) => value.toISOString()),
  status: z.enum(["pending", "completed"]),
  notes: z.string().trim().max(5000).transform((value) => value || null),
});
