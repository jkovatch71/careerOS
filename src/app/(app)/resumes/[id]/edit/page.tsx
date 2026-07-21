import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteResumeButton } from "@/features/resumes/delete-resume-button";
import { ResumeMetadataForm } from "@/features/resumes/resume-metadata-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit resume" };

export default async function EditResumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: resume } = await supabase.from("resumes").select("*").eq("id", id).maybeSingle();
  if (!resume) notFound();
  return <div className="mx-auto max-w-3xl"><div className="flex items-center justify-between gap-4"><Link href="/resumes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Resumes</Link><DeleteResumeButton resumeId={resume.id} resumeName={resume.name} /></div><Card className="mt-5"><CardHeader><CardTitle>{resume.name}</CardTitle><CardDescription>Update how this resume is organized in your library.</CardDescription></CardHeader><CardContent><ResumeMetadataForm resume={resume} /></CardContent></Card></div>;
}
