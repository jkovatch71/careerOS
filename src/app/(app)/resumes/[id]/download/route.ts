import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: resume } = await supabase.from("resumes").select("name, file_url").eq("id", id).maybeSingle();
  if (!resume?.file_url) return new NextResponse("Resume not found", { status: 404 });
  if (resume.file_url.startsWith("http")) return NextResponse.redirect(resume.file_url);

  const { data, error } = await supabase.storage.from("resumes").createSignedUrl(resume.file_url, 60, { download: resume.name });
  if (error || !data?.signedUrl) return new NextResponse("Resume could not be downloaded", { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
