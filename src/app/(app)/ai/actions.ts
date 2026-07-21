"use server";

import { redirect } from "next/navigation";

import { testCloudflareAiConnection } from "@/lib/ai/cloudflare";
import { createClient } from "@/lib/supabase/server";

export type AiConnectionState = {
  status?: "success" | "error";
  message?: string;
  model?: string;
};

export async function testAiConnection(): Promise<AiConnectionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || typeof data?.claims?.sub !== "string") redirect("/login");

  try {
    const result = await testCloudflareAiConnection();
    return {
      status: "success",
      message: result.response || "Career OS connected",
      model: result.model,
    };
  } catch (connectionError) {
    return {
      status: "error",
      message:
        connectionError instanceof Error
          ? connectionError.message
          : "Career OS could not reach Cloudflare Workers AI.",
    };
  }
}
