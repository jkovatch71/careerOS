"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { followUpSchema } from "@/features/follow-ups/schemas";
import { createClient } from "@/lib/supabase/server";

export type FollowUpActionState = { error?: string };

function values(formData: FormData) {
  return { opportunity_id: formData.get("opportunity_id"), contact_id: formData.get("contact_id"), follow_up_type: formData.get("follow_up_type"), due_at: formData.get("due_at"), status: formData.get("status"), notes: formData.get("notes") };
}

async function authenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !userId) redirect("/login");
  return { supabase, userId };
}

async function validateRelations(opportunityId: string | null, contactId: string | null, userId: string) {
  const supabase = await createClient();
  const [opportunity, contact] = await Promise.all([
    opportunityId ? supabase.from("opportunities").select("id").eq("id", opportunityId).eq("user_id", userId).maybeSingle() : null,
    contactId ? supabase.from("contacts").select("id").eq("id", contactId).eq("user_id", userId).maybeSingle() : null,
  ]);
  return { opportunityValid: !opportunityId || Boolean(opportunity?.data), contactValid: !contactId || Boolean(contact?.data) };
}

export async function createFollowUp(_: FollowUpActionState, formData: FormData): Promise<FollowUpActionState> {
  const parsed = followUpSchema.safeParse(values(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Review the follow-up details." };
  const { supabase, userId } = await authenticatedUser();
  const validity = await validateRelations(parsed.data.opportunity_id, parsed.data.contact_id, userId);
  if (!validity.opportunityValid) return { error: "Select an opportunity you own." };
  if (!validity.contactValid) return { error: "Select a contact you own." };
  const { error } = await supabase.from("follow_ups").insert({ ...parsed.data, completed_at: parsed.data.status === "completed" ? new Date().toISOString() : null, user_id: userId });
  if (error) return { error: "Career OS could not create this follow-up." };
  revalidatePath("/follow-ups");
  redirect("/follow-ups");
}

export async function updateFollowUp(id: string, _: FollowUpActionState, formData: FormData): Promise<FollowUpActionState> {
  const parsed = followUpSchema.safeParse(values(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Review the follow-up details." };
  const { supabase, userId } = await authenticatedUser();
  const validity = await validateRelations(parsed.data.opportunity_id, parsed.data.contact_id, userId);
  if (!validity.opportunityValid) return { error: "Select an opportunity you own." };
  if (!validity.contactValid) return { error: "Select a contact you own." };
  const { error } = await supabase.from("follow_ups").update({ ...parsed.data, completed_at: parsed.data.status === "completed" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
  if (error) return { error: "Career OS could not update this follow-up." };
  revalidatePath("/follow-ups");
  redirect("/follow-ups");
}

export async function setFollowUpCompletion(id: string, completed: boolean) {
  const { supabase, userId } = await authenticatedUser();
  await supabase.from("follow_ups").update({ status: completed ? "completed" : "pending", completed_at: completed ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", userId);
  revalidatePath("/follow-ups");
}

export async function deleteFollowUp(id: string) {
  const { supabase, userId } = await authenticatedUser();
  const { error } = await supabase.from("follow_ups").delete().eq("id", id).eq("user_id", userId);
  if (error) redirect(`/follow-ups/${id}/edit?error=delete`);
  revalidatePath("/follow-ups");
  redirect("/follow-ups");
}
