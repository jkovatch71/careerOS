"use client";

import { useActionState } from "react";
import { CheckCircle2, FileSearch, LoaderCircle, TriangleAlert } from "lucide-react";

import { analyzeResumeMatch, type ResumeMatchState } from "@/app/(app)/ai/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Option = { id: string; label: string };
const initialState: ResumeMatchState = {};

function MatchList({ title, items }: { title: string; items: string[] }) {
  return <div><h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h4>{items.length ? <ul className="mt-2 space-y-1.5 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">None identified</p>}</div>;
}

export function ResumeMatcher({ opportunities, resumes }: { opportunities: Option[]; resumes: Option[] }) {
  const [state, action, pending] = useActionState(analyzeResumeMatch, initialState);
  const unavailable = opportunities.length === 0 || resumes.length === 0;

  return <div>
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="match_opportunity_id">Opportunity</Label><select id="match_opportunity_id" name="opportunity_id" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Select an analyzed opportunity</option>{opportunities.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="resume_id">Resume</Label><select id="resume_id" name="resume_id" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Select a resume</option>{resumes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="sm:col-span-2"><Button type="submit" disabled={pending || unavailable}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <FileSearch className="size-4" />}{pending ? "Comparing…" : "Compare and save"}</Button><p className="mt-2 text-xs text-muted-foreground">Runs only when requested. Text-based PDF and DOCX files are supported.</p></div>
    </form>

    {state.status === "error" ? <div role="alert" className="mt-5 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><TriangleAlert className="mt-0.5 size-4 shrink-0" />{state.message}</div> : null}
    {state.status === "success" && state.match ? <div className="mt-6 rounded-xl border bg-muted/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-medium text-emerald-300"><CheckCircle2 className="size-4" />{state.message}</div><div className="rounded-lg border bg-background px-3 py-2 text-right"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Match score</p><p className="text-2xl font-semibold text-primary">{Math.round(state.match.match_score)}</p></div></div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{state.match.verdict}</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2"><MatchList title="Strongest matches" items={state.match.strongest_matches} /><MatchList title="Evidence" items={state.match.evidence} /><MatchList title="Gaps" items={state.match.gaps} /><MatchList title="Resume recommendations" items={state.match.resume_recommendations} /><MatchList title="Matched keywords" items={state.match.matched_keywords} /><MatchList title="Missing keywords" items={state.match.missing_keywords} /><div className="md:col-span-2"><MatchList title="Interview focus" items={state.match.interview_focus} /></div></div>
    </div> : null}
  </div>;
}
