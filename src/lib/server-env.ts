import "server-only";

import { z } from "zod";

const cloudflareEnvSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_AI_API_TOKEN: z.string().min(1),
});

export function getCloudflareEnv() {
  const parsed = cloudflareEnvSchema.safeParse({
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_AI_API_TOKEN: process.env.CLOUDFLARE_AI_API_TOKEN,
  });

  if (!parsed.success) {
    throw new Error("Cloudflare Workers AI is not configured.");
  }

  return parsed.data;
}
