"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { outreachSchema } from "@/features/outreach/schemas";
import { createClient } from "@/lib/supabase/server";

export type OutreachActionState = { error?: string };

function values(formData: FormData) {
  return { opportunity_id: formData.get("opportunity_id"), contact_id: formData.get("contact_id"), channel: formData.get("channel"), message: formData.get("message"), sent_at: formData.get("sent_at"), response_at: formData.get("response_at"), outcome: formData.get("outcome") };
}

async function authenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !userId) redirect("/login");
  return { supabase, userId };
}

async function ownsRelation(table: "opportunities" | "contacts", id: string | null, userId: string) {
  if (!id) return true;
  const supabase = await createClient();
  const { data } = await supabase.from(table).select("id").eq("id", id).eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

export async function createOutreach(_: OutreachActionState, formData: FormData): Promise<OutreachActionState> {
  const parsed = outreachSchema.safeParse(values(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Review the outreach details." };
  const { supabase, userId } = await authenticatedUser();
  if (!(await ownsRelation("opportunities", parsed.data.opportunity_id, userId))) return { error: "Select an opportunity you own." };
  if (!(await ownsRelation("contacts", parsed.data.contact_id, userId))) return { error: "Select a contact you own." };
  const { error } = await supabase.from("outreach").insert({ ...parsed.data, user_id: userId });
  if (error) return { error: "Career OS could not create this outreach entry." };
  revalidatePath("/outreach");
  redirect("/outreach");
}

export async function updateOutreach(id: string, _: OutreachActionState, formData: FormData): Promise<OutreachActionState> {
  const parsed = outreachSchema.safeParse(values(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Review the outreach details." };
  const { supabase, userId } = await authenticatedUser();
  if (!(await ownsRelation("opportunities", parsed.data.opportunity_id, userId))) return { error: "Select an opportunity you own." };
  if (!(await ownsRelation("contacts", parsed.data.contact_id, userId))) return { error: "Select a contact you own." };
  const { error } = await supabase.from("outreach").update(parsed.data).eq("id", id).eq("user_id", userId);
  if (error) return { error: "Career OS could not update this outreach entry." };
  revalidatePath("/outreach");
  redirect("/outreach");
}

export async function deleteOutreach(id: string) {
  const { supabase, userId } = await authenticatedUser();
  const { error } = await supabase.from("outreach").delete().eq("id", id).eq("user_id", userId);
  if (error) redirect(`/outreach/${id}/edit?error=delete`);
  revalidatePath("/outreach");
  redirect("/outreach");
}
