import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Plus, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Resume Library" };

export default async function ResumesPage() {
  const supabase = await createClient();
  const { data: resumes, error } = await supabase
    .from("resumes")
    .select("*")
    .order("is_master", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-sm text-muted-foreground">Career assets</p><h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Resume Library</h1><p className="mt-2 text-sm text-muted-foreground">Manage master and role-focused resume versions securely.</p></div>
        <Link href="/resumes/new" className={cn(buttonVariants())}><Plus className="size-4" /> Add resume</Link>
      </div>
      {error ? (
        <Card className="mt-8 border-destructive/40"><CardContent className="p-6 text-sm text-destructive">Career OS could not load resumes.</CardContent></Card>
      ) : resumes.length === 0 ? (
        <Card className="mt-8"><CardContent className="flex min-h-72 flex-col items-center justify-center text-center"><span className="flex size-11 items-center justify-center rounded-lg border bg-muted/30"><FileText className="size-5 text-muted-foreground" /></span><h2 className="mt-4 text-sm font-medium">No resumes yet</h2><p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">Upload your master resume or a version tailored to a target role.</p><Link href="/resumes/new" className={cn(buttonVariants({ size: "sm" }), "mt-5")}><Plus className="size-4" /> Upload your first resume</Link></CardContent></Card>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border">
          <div className="hidden grid-cols-[minmax(240px,2fr)_1.5fr_120px_180px] gap-4 border-b bg-card/70 px-5 py-3 text-xs font-medium text-muted-foreground md:grid"><span>Resume</span><span>Focus</span><span>Type</span><span>Actions</span></div>
          <div className="divide-y">{resumes.map((resume) => (
            <div key={resume.id} className="grid gap-3 bg-background px-5 py-4 md:grid-cols-[minmax(240px,2fr)_1.5fr_120px_180px] md:items-center md:gap-4">
              <Link href={`/resumes/${resume.id}/edit`} className="min-w-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><p className="truncate text-sm font-medium">{resume.name}</p><p className="mt-1 text-xs text-muted-foreground">Added {resume.created_at ? new Date(resume.created_at).toLocaleDateString("en-US") : "—"}</p></Link>
              <p className="truncate text-sm text-muted-foreground">{resume.focus ?? "General"}</p>
              <span className="flex w-fit items-center gap-1 rounded-full border bg-muted/30 px-2 py-1 text-xs">{resume.is_master ? <Star className="size-3 fill-current" /> : null}{resume.is_master ? "Master" : "Version"}</span>
              <div className="flex items-center gap-2"><Link href={`/resumes/${resume.id}/download`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}><Download className="size-3.5" /> Download</Link><Link href={`/resumes/${resume.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>Edit</Link></div>
            </div>
          ))}</div>
        </div>
      )}
    </div>
  );
}
