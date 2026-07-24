import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BriefcaseBusiness, Building2, CalendarClock, ChevronLeft, ExternalLink, Mail, Pencil, Sparkles, Target, UserRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { companyResearchSchema } from "@/features/ai/company-research";
import { jobAnalysisSchema } from "@/features/ai/job-description";
import { resumeMatchSchema } from "@/features/ai/resume-match";
import { opportunityStageLabel } from "@/features/opportunities/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Opportunity intelligence" };

function formatDate(value: string | null, includeTime = false) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", includeTime ? { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric", year: "numeric" });
}

function IntelligenceList({ title, items }: { title: string; items: string[] }) {
  return <div><h4 className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</h4>{items.length ? <ul className="mt-2 space-y-1.5 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">None identified</p>}</div>;
}

export default async function OpportunityIntelligencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const opportunityResult = await supabase.from("opportunities").select("*").eq("id", id).maybeSingle();
  const opportunity = opportunityResult.data;
  if (!opportunity) notFound();

  const [employerResult, firmResult, primaryContactResult, recruiterResult, analysesResult, outreachResult, followUpsResult] = await Promise.all([
    opportunity.company_id ? supabase.from("companies").select("id, name, website, industry").eq("id", opportunity.company_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    opportunity.recruiting_firm_id ? supabase.from("companies").select("id, name").eq("id", opportunity.recruiting_firm_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    opportunity.primary_contact_id ? supabase.from("contacts").select("id, name, title, email, linkedin_url").eq("id", opportunity.primary_contact_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    opportunity.recruiter_contact_id ? supabase.from("contacts").select("id, name, title, email, linkedin_url").eq("id", opportunity.recruiter_contact_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    supabase.from("ai_analyses").select("*").eq("opportunity_id", id).order("created_at", { ascending: false }),
    supabase.from("outreach").select("id, channel, outcome, sent_at, response_at, message, contact:contacts(id, name)").eq("opportunity_id", id).order("sent_at", { ascending: false, nullsFirst: false }).limit(5),
    supabase.from("follow_ups").select("id, follow_up_type, due_at, completed_at, status, notes, contact:contacts(id, name)").eq("opportunity_id", id).order("due_at", { ascending: true }).limit(5),
  ]);

  const analyses = analysesResult.data ?? [];
  const resumeIds = Array.from(new Set(analyses.flatMap((item) => item.resume_id ? [item.resume_id] : [])));
  const resumeResult = resumeIds.length ? await supabase.from("resumes").select("id, name").in("id", resumeIds) : { data: [], error: null };
  const resumeNames = new Map((resumeResult.data ?? []).map((resume) => [resume.id, resume.name]));
  const employer = employerResult.data;
  const recruitingFirm = firmResult.data;
  const primaryContact = primaryContactResult.data;
  const recruiter = recruiterResult.data;
  const jobRecord = analyses.find((item) => item.analysis_type === "job_description");
  const matchRecord = analyses.find((item) => item.analysis_type === "resume_match");
  const researchRecord = analyses.find((item) => item.analysis_type === "company_research");
  const jobAnalysis = jobRecord ? jobAnalysisSchema.safeParse(jobRecord.result) : null;
  const resumeMatch = matchRecord ? resumeMatchSchema.safeParse(matchRecord.result) : null;
  const companyResearch = researchRecord ? companyResearchSchema.safeParse(researchRecord.result) : null;
  const outreach = outreachResult.data ?? [];
  const followUps = followUpsResult.data ?? [];
  const hasLoadError = Boolean(opportunityResult.error || employerResult.error || firmResult.error || primaryContactResult.error || recruiterResult.error || analysesResult.error || resumeResult.error || outreachResult.error || followUpsResult.error);

  return <div className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><Link href="/opportunities" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Opportunities</Link><div className="flex items-center gap-2">{opportunity.job_url ? <a href={opportunity.job_url} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}><ExternalLink className="size-3.5" /> Job posting</a> : null}<Link href={`/opportunities/${opportunity.id}/edit`} className={cn(buttonVariants({ size: "sm" }))}><Pencil className="size-3.5" /> Edit</Link></div></div>

    <div className="mt-5 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full border bg-muted/30 px-2.5 py-1 text-xs">{opportunityStageLabel(opportunity.stage)}</span>{opportunity.fit_score !== null ? <span className="rounded-full border px-2.5 py-1 font-mono text-xs">Fit {opportunity.fit_score}</span> : null}</div><h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{opportunity.role_title}</h1><p className="mt-2 text-sm text-muted-foreground">{employer?.name ?? "Company not set"}{employer?.industry ? ` · ${employer.industry}` : ""}</p></div><div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:text-right"><div><p className="text-xs text-muted-foreground">Compensation</p><p className="mt-1">{opportunity.compensation ?? "—"}</p></div><div><p className="text-xs text-muted-foreground">Applied</p><p className="mt-1">{formatDate(opportunity.applied_at)}</p></div></div></div>
    {hasLoadError ? <div className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">Some opportunity intelligence could not be loaded.</div> : null}

    <section className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
      <Card><CardHeader><CardTitle className="text-base">Decision context</CardTitle><CardDescription>Current status, next commitment, and working notes.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><Info label="Source" value={opportunity.source ?? "Not specified"} /><Info label="Next action due" value={formatDate(opportunity.next_action_at, true)} /><div className="sm:col-span-2"><Info label="Next action" value={opportunity.next_action ?? "No next action set"} /></div>{opportunity.notes ? <div className="sm:col-span-2"><Info label="Notes" value={opportunity.notes} /></div> : null}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Relationships</CardTitle><CardDescription>People and firms influencing this opportunity.</CardDescription></CardHeader><CardContent className="space-y-4"><Relationship icon={Building2} label="Employer" name={employer?.name} detail={employer?.website} /><Relationship icon={UserRound} label="Primary contact" name={primaryContact?.name} detail={primaryContact?.title ?? primaryContact?.email} /><Relationship icon={BriefcaseBusiness} label="Recruiting firm" name={recruitingFirm?.name} /><Relationship icon={UserRound} label="Recruiter" name={recruiter?.name} detail={recruiter?.title ?? recruiter?.email} /></CardContent></Card>
    </section>

    <section className="mt-4"><div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="text-lg font-semibold">AI intelligence</h2><p className="mt-1 text-xs text-muted-foreground">Latest saved analysis of each type.</p></div><Link href="/ai" className="text-xs font-medium text-primary hover:underline">Open AI workspace</Link></div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4 text-primary" /> Job brief</CardTitle><CardDescription>{jobRecord ? `Updated ${formatDate(jobRecord.created_at)}` : "No analysis saved"}</CardDescription></CardHeader><CardContent>{jobAnalysis?.success ? <div><p className="text-sm font-medium">{jobAnalysis.data.seniority}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{jobAnalysis.data.executive_summary}</p><details className="mt-4"><summary className="cursor-pointer text-xs font-medium text-primary">View responsibilities and requirements</summary><div className="mt-4 space-y-4"><IntelligenceList title="Responsibilities" items={jobAnalysis.data.responsibilities} /><IntelligenceList title="Requirements" items={jobAnalysis.data.required_qualifications} /></div></details></div> : <EmptyIntelligence message="Analyze the saved job description to create a role brief." />}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="size-4 text-primary" /> Resume match</CardTitle><CardDescription>{matchRecord ? `${(matchRecord.resume_id && resumeNames.get(matchRecord.resume_id)) || "Resume"} · ${formatDate(matchRecord.created_at)}` : "No match saved"}</CardDescription></CardHeader><CardContent>{resumeMatch?.success ? <div><div className="flex items-end gap-2"><span className="text-4xl font-semibold text-primary">{Math.round(resumeMatch.data.match_score)}</span><span className="pb-1 text-xs text-muted-foreground">/ 100</span></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{resumeMatch.data.verdict}</p><details className="mt-4"><summary className="cursor-pointer text-xs font-medium text-primary">View matches and gaps</summary><div className="mt-4 space-y-4"><IntelligenceList title="Strongest matches" items={resumeMatch.data.strongest_matches} /><IntelligenceList title="Gaps" items={resumeMatch.data.gaps} /><IntelligenceList title="Recommendations" items={resumeMatch.data.resume_recommendations} /></div></details></div> : <EmptyIntelligence message="Compare a saved resume with this opportunity." />}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="size-4 text-primary" /> Company brief</CardTitle><CardDescription>{researchRecord ? `Updated ${formatDate(researchRecord.created_at)}` : "No research saved"}</CardDescription></CardHeader><CardContent>{companyResearch?.success ? <div><p className="text-sm leading-6 text-muted-foreground">{companyResearch.data.company_snapshot}</p><details className="mt-4"><summary className="cursor-pointer text-xs font-medium text-primary">View strategic intelligence</summary><div className="mt-4 space-y-4"><IntelligenceList title="Strategic priorities" items={companyResearch.data.strategic_priorities} /><IntelligenceList title="Role implications" items={companyResearch.data.role_implications} /><IntelligenceList title="Interview questions" items={companyResearch.data.interview_questions} /></div></details></div> : <EmptyIntelligence message="Create a source-grounded company research brief." />}</CardContent></Card>
      </div>
    </section>

    <section className="mt-4 grid gap-4 lg:grid-cols-2">
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="text-base">Follow-ups</CardTitle><CardDescription className="mt-1">Upcoming and completed commitments.</CardDescription></div><Link href="/follow-ups/new" className="text-xs font-medium text-primary hover:underline">Add</Link></CardHeader><CardContent>{followUps.length ? <div className="divide-y">{followUps.map((item) => <Link key={item.id} href={`/follow-ups/${item.id}/edit`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.follow_up_type ?? "Follow-up"}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.contact?.name ?? item.notes ?? "No contact"}</p></div><div className="text-right"><p className="text-xs">{formatDate(item.due_at)}</p><p className="mt-1 text-[10px] uppercase text-muted-foreground">{item.status}</p></div></Link>)}</div> : <EmptyIntelligence message="No follow-ups linked to this opportunity." />}</CardContent></Card>
      <Card><CardHeader className="flex-row items-start justify-between"><div><CardTitle className="text-base">Outreach</CardTitle><CardDescription className="mt-1">Recent relationship activity.</CardDescription></div><Link href="/outreach/new" className="text-xs font-medium text-primary hover:underline">Log</Link></CardHeader><CardContent>{outreach.length ? <div className="divide-y">{outreach.map((item) => <Link key={item.id} href={`/outreach/${item.id}/edit`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.channel ?? "Outreach"}{item.contact?.name ? ` · ${item.contact.name}` : ""}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.message ?? "No notes"}</p></div><div className="text-right"><p className="text-xs">{formatDate(item.sent_at)}</p><p className="mt-1 text-[10px] uppercase text-muted-foreground">{item.outcome ?? "Pending"}</p></div></Link>)}</div> : <EmptyIntelligence message="No outreach linked to this opportunity." />}</CardContent></Card>
    </section>

    {analyses.length > 1 ? <Card className="mt-4"><CardHeader><CardTitle className="text-base">Analysis history</CardTitle><CardDescription>Every saved AI run for this opportunity.</CardDescription></CardHeader><CardContent><div className="divide-y">{analyses.map((item) => <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><Sparkles className="size-4 text-muted-foreground" /><div className="flex-1"><p className="text-sm font-medium">{item.analysis_type === "job_description" ? "Job description brief" : item.analysis_type === "resume_match" ? "Resume match" : "Company research"}</p><p className="mt-1 text-xs text-muted-foreground">{(item.resume_id && resumeNames.get(item.resume_id)) || item.model}</p></div><span className="text-xs text-muted-foreground">{formatDate(item.created_at, true)}</span></div>)}</div></CardContent></Card> : null}
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6">{value}</p></div>; }
function Relationship({ icon: Icon, label, name, detail }: { icon: typeof UserRound; label: string; name?: string | null; detail?: string | null }) { return <div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/20"><Icon className="size-4 text-muted-foreground" /></span><div className="min-w-0"><p className="text-[11px] text-muted-foreground">{label}</p><p className="truncate text-sm font-medium">{name ?? "Not specified"}</p>{detail ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{detail}</p> : null}</div></div>; }
function EmptyIntelligence({ message }: { message: string }) { return <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center"><ArrowUpRight className="size-4 text-muted-foreground" /><p className="mt-2 text-xs leading-5 text-muted-foreground">{message}</p></div>; }
