"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resumeMetadataSchema } from "@/features/resumes/schemas";
import { createClient } from "@/lib/supabase/server";

export type ResumeActionState = { error?: string };

async function authenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !userId) redirect("/login");
  return { supabase, userId };
}

export async function updateResume(
  resumeId: string,
  _: ResumeActionState,
  formData: FormData,
): Promise<ResumeActionState> {
  const parsed = resumeMetadataSchema.safeParse({
    name: formData.get("name"),
    focus: formData.get("focus"),
    is_master: formData.get("is_master") === "on",
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Review the resume details." };

  const { supabase, userId } = await authenticatedUser();
  const { error } = await supabase
    .from("resumes")
    .update(parsed.data)
    .eq("id", resumeId)
    .eq("user_id", userId);
  if (error) return { error: "Career OS could not update this resume." };

  revalidatePath("/resumes");
  redirect("/resumes");
}

export async function deleteResume(resumeId: string) {
  const { supabase, userId } = await authenticatedUser();
  const { data: resume } = await supabase
    .from("resumes")
    .select("file_url")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!resume) redirect("/resumes");

  if (resume.file_url && !resume.file_url.startsWith("http")) {
    const { error: storageError } = await supabase.storage.from("resumes").remove([resume.file_url]);
    if (storageError) redirect(`/resumes/${resumeId}/edit?error=file`);
  }

  const { error } = await supabase.from("resumes").delete().eq("id", resumeId).eq("user_id", userId);
  if (error) redirect(`/resumes/${resumeId}/edit?error=delete`);

  revalidatePath("/resumes");
  redirect("/resumes");
}
