import type { Metadata } from "next";
import { BrainCircuit, ShieldCheck, WalletCards } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionCheck } from "@/features/ai/connection-check";
import { JobDescriptionParser } from "@/features/ai/job-description-parser";
import { ResumeMatcher } from "@/features/ai/resume-matcher";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "AI Setup" };

export default async function AiPage() {
  const supabase = await createClient();
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("id, role_title, job_description, employer:companies!opportunities_company_id_fkey(name)")
    .order("updated_at", { ascending: false, nullsFirst: false });
  const opportunityOptions = (opportunities ?? []).map((opportunity) => ({
    id: opportunity.id,
    label: `${opportunity.role_title}${opportunity.employer?.name ? ` — ${opportunity.employer.name}` : ""}`,
    jobDescription: opportunity.job_description,
  }));
  const { data: resumes } = await supabase.from("resumes").select("id, name, focus, file_url").order("is_master", { ascending: false }).order("created_at", { ascending: false });
  const analyzedOpportunityOptions = opportunityOptions.filter((opportunity) => opportunity.jobDescription).map(({ id, label }) => ({ id, label }));
  const resumeOptions = (resumes ?? []).filter((resume) => resume.file_url).map((resume) => ({ id: resume.id, label: `${resume.name}${resume.focus ? ` — ${resume.focus}` : ""}` }));
  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-sm text-muted-foreground">Sprint 4</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">AI workspace</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Verify the private Workers AI connection before enabling job parsing and resume matching.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BrainCircuit className="size-4 text-primary" /> Connection check</CardTitle>
            <CardDescription>This sends one very small prompt only when you click the button.</CardDescription>
          </CardHeader>
          <CardContent><ConnectionCheck /></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage safeguards</CardTitle>
            <CardDescription>Designed around Cloudflare&apos;s free daily allowance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><p className="font-medium">Server-only credentials</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Your API token is never sent to the browser.</p></div></div>
            <div className="flex gap-3"><WalletCards className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><p className="font-medium">Manual AI actions</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Career OS will not run AI automatically or in the background.</p></div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Job description parser</CardTitle>
          <CardDescription>Turn a pasted posting into a structured executive-level brief and save it to the opportunity.</CardDescription>
        </CardHeader>
        <CardContent>
          {opportunityOptions.length ? <JobDescriptionParser opportunities={opportunityOptions} /> : <p className="text-sm text-muted-foreground">Add an opportunity before analyzing a job description.</p>}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Resume match</CardTitle>
          <CardDescription>Compare a private resume against a saved job description using evidence from both documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResumeMatcher opportunities={analyzedOpportunityOptions} resumes={resumeOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
