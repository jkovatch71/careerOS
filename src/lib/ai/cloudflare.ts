import "server-only";

import { z } from "zod";

import { getCloudflareEnv } from "@/lib/server-env";

export const CLOUDFLARE_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const cloudflareResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({ response: z.string() }).optional(),
  errors: z.array(z.object({ message: z.string().optional() })).optional(),
});

export async function testCloudflareAiConnection() {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_AI_API_TOKEN } = getCloudflareEnv();
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(CLOUDFLARE_ACCOUNT_ID)}/ai/run/${CLOUDFLARE_AI_MODEL}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_AI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Reply with exactly: Career OS connected" }],
      max_tokens: 12,
      temperature: 0,
    }),
    cache: "no-store",
  });

  const payload = cloudflareResponseSchema.safeParse(await response.json());

  if (!response.ok || !payload.success || !payload.data.success || !payload.data.result) {
    const message = payload.success
      ? payload.data.errors?.[0]?.message
      : "Cloudflare returned an unexpected response.";
    throw new Error(message || "Cloudflare Workers AI rejected the request.");
  }

  return { model: CLOUDFLARE_AI_MODEL, response: payload.data.result.response.trim() };
}
