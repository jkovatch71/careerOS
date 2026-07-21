"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { OPPORTUNITY_STAGES } from "@/features/opportunities/constants";
import { createClient } from "@/lib/supabase/server";

export type PipelineStageActionState = { error?: string };

export async function moveOpportunityStage(
  opportunityId: string,
  _: PipelineStageActionState,
  formData: FormData,
): Promise<PipelineStageActionState> {
  const stage = formData.get("stage");
  const validStage = OPPORTUNITY_STAGES.some((option) => option.value === stage);

  if (typeof stage !== "string" || !validStage) {
    return { error: "Select a valid pipeline stage." };
  }

  const supabase = await createClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (authError || !userId) redirect("/login");

  const { error } = await supabase
    .from("opportunities")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("id", opportunityId)
    .eq("user_id", userId);

  if (error) return { error: "Career OS could not move this opportunity." };

  revalidatePath("/pipeline");
  revalidatePath("/opportunities");
  return {};
}
