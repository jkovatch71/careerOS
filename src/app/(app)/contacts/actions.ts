"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { contactSchema } from "@/features/contacts/schemas";
import { createClient } from "@/lib/supabase/server";

export type ContactActionState = { error?: string };

function valuesFromForm(formData: FormData) {
  return {
    company_id: formData.get("company_id"),
    name: formData.get("name"),
    title: formData.get("title"),
    email: formData.get("email"),
    linkedin_url: formData.get("linkedin_url"),
    contact_type: formData.get("contact_type"),
    notes: formData.get("notes"),
  };
}

async function authenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !userId) redirect("/login");
  return { supabase, userId };
}

async function ownsCompany(companyId: string | null, userId: string) {
  if (!companyId) return true;
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

export async function createContact(
  _: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse(valuesFromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Review the contact details." };

  const { supabase, userId } = await authenticatedUser();
  if (!(await ownsCompany(parsed.data.company_id, userId))) return { error: "Select an organization you own." };

  const { error } = await supabase.from("contacts").insert({ ...parsed.data, user_id: userId });
  if (error) return { error: "Career OS could not create this contact." };

  revalidatePath("/contacts");
  redirect("/contacts");
}

export async function updateContact(
  contactId: string,
  _: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse(valuesFromForm(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Review the contact details." };

  const { supabase, userId } = await authenticatedUser();
  if (!(await ownsCompany(parsed.data.company_id, userId))) return { error: "Select an organization you own." };

  const { error } = await supabase
    .from("contacts")
    .update(parsed.data)
    .eq("id", contactId)
    .eq("user_id", userId);
  if (error) return { error: "Career OS could not update this contact." };

  revalidatePath("/contacts");
  redirect("/contacts");
}

export async function deleteContact(contactId: string) {
  const { supabase, userId } = await authenticatedUser();
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", contactId)
    .eq("user_id", userId);
  if (error) redirect(`/contacts/${contactId}/edit?error=delete`);

  revalidatePath("/contacts");
  redirect("/contacts");
}
