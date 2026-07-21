import "server-only";

import { z } from "zod";

import { getCloudflareEnv } from "@/lib/server-env";

export const CLOUDFLARE_AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const cloudflareResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({ response: z.unknown() }).optional(),
  errors: z.array(z.object({ message: z.string().optional() })).optional(),
});

type JsonSchema = Record<string, unknown>;

async function runCloudflareAi(body: Record<string, unknown>) {
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_AI_API_TOKEN } = getCloudflareEnv();
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(CLOUDFLARE_ACCOUNT_ID)}/ai/run/${CLOUDFLARE_AI_MODEL}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_AI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const rawPayload: unknown = await response.json();
  const payload = cloudflareResponseSchema.safeParse(rawPayload);

  if (!response.ok || !payload.success || !payload.data.success || !payload.data.result) {
    const message = payload.success
      ? payload.data.errors?.[0]?.message
      : "Cloudflare returned an unexpected response.";
    throw new Error(message || "Cloudflare Workers AI rejected the request.");
  }

  return payload.data.result.response;
}

export async function generateStructuredResponse<T>({
  system,
  prompt,
  jsonSchema,
  outputSchema,
  maxTokens = 1800,
}: {
  system: string;
  prompt: string;
  jsonSchema: JsonSchema;
  outputSchema: z.ZodType<T>;
  maxTokens?: number;
}) {
  const response = await runCloudflareAi({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_schema", json_schema: jsonSchema },
    max_tokens: maxTokens,
    temperature: 0.1,
  });

  let parsedJson: unknown = response;
  if (typeof response === "string") {
    try {
      parsedJson = JSON.parse(response);
    } catch {
      throw new Error("Workers AI returned an invalid structured response. Please try again.");
    }
  }

  const parsed = outputSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error("Workers AI returned an incomplete analysis. Please try again.");
  }

  return parsed.data;
}

export async function testCloudflareAiConnection() {
  const response = await runCloudflareAi({
    messages: [{ role: "user", content: "Reply with exactly: Career OS connected" }],
    max_tokens: 12,
    temperature: 0,
  });

  return {
    model: CLOUDFLARE_AI_MODEL,
    response: typeof response === "string" ? response.trim() : "Career OS connected",
  };
}
