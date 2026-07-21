import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).transform((value) => value || null);

export const resumeMetadataSchema = z.object({
  name: z.string().trim().min(1, "Resume name is required.").max(160),
  focus: optionalText(160),
  is_master: z.boolean(),
  notes: optionalText(5000),
});
