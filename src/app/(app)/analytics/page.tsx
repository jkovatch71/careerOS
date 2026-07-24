import type { Metadata } from "next";
import { Activity, BarChart3, MessageSquareReply, Target } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OPPORTUNITY_STAGES } from "@/features/opportunities/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Analytics" };

const ACTIVE_STAGES: ReadonlySet<string> = new Set(OPPORTUNITY_STAGES.slice(0, 7).map((stage) => stage.value));

function percentage(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 100) : 0;
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const [opportunityResult, outreachResult, followUpResult] = await Promise.all([
    supabase.from("opportunities").select("id, stage, source, fit_score, applied_at"),
    supabase.from("outreach").select("id, sent_at, response_at, outcome"),
    supabase.from("follow_ups").select("id, status, completed_at"),
  ]);

  const opportunities = opportunityResult.data ?? [];
  const outreach = outreachResult.data ?? [];
  const followUps = followUpResult.data ?? [];
  const activeCount = opportunities.filter((item) => ACTIVE_STAGES.has(item.stage ?? "research")).length;
  const appliedCount = opportunities.filter((item) => item.applied_at).length;
  const fitScores = opportunities.flatMap((item) => item.fit_score === null ? [] : [item.fit_score]);
  const averageFit = fitScores.length ? Math.round(fitScores.reduce((total, score) => total + score, 0) / fitScores.length) : null;
  const sentOutreach = outreach.filter((item) => item.sent_at);
  const responses = sentOutreach.filter((item) => item.response_at);
  const completedFollowUps = followUps.filter((item) => item.status === "completed" || item.completed_at);
  const hasLoadError = Boolean(opportunityResult.error || outreachResult.error || followUpResult.error);

  const stageData = OPPORTUNITY_STAGES.map((stage) => ({
    label: stage.label,
    value: opportunities.filter((item) => (item.stage ?? "research") === stage.value).length,
  })).filter((item) => item.value > 0);
  const sourceNames = Array.from(new Set(opportunities.map((item) => item.source ?? "Not specified")));
  const sourceData = sourceNames.map((source) => ({ label: source, value: opportunities.filter((item) => (item.source ?? "Not specified") === source).length })).sort((a, b) => b.value - a.value);
  const maxStage = Math.max(1, ...stageData.map((item) => item.value));
  const maxSource = Math.max(1, ...sourceData.map((item) => item.value));

  const metrics = [
    { label: "Tracked opportunities", value: opportunities.length, detail: `${activeCount} active`, icon: Target },
    { label: "Applications recorded", value: appliedCount, detail: `${percentage(appliedCount, opportunities.length)}% of tracked roles`, icon: Activity },
    { label: "Average fit score", value: averageFit ?? "—", detail: fitScores.length ? `${fitScores.length} scored role${fitScores.length === 1 ? "" : "s"}` : "No roles scored", icon: BarChart3 },
    { label: "Outreach response", value: `${percentage(responses.length, sentOutreach.length)}%`, detail: `${responses.length} of ${sentOutreach.length} sent`, icon: MessageSquareReply },
  ];

  return <div className="mx-auto max-w-7xl">
    <div><p className="text-sm text-muted-foreground">Operating intelligence</p><h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Analytics</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Current-state signals from your pipeline, outreach, and execution habits.</p></div>
    {hasLoadError ? <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">Some analytics could not be loaded. Refresh the page to try again.</div> : null}

    <section aria-label="Performance metrics" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, detail, icon: Icon }) => <Card key={label}><CardHeader className="flex-row items-start justify-between pb-2"><CardDescription>{label}</CardDescription><Icon className="size-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs text-muted-foreground">{detail}</p></CardContent></Card>)}
    </section>

    <section className="mt-4 grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-base">Pipeline snapshot</CardTitle><CardDescription>Where tracked opportunities sit today—not historical conversion.</CardDescription></CardHeader><CardContent>{stageData.length ? <div className="space-y-3">{stageData.map((item) => <div key={item.label} className="grid grid-cols-[130px_1fr_28px] items-center gap-3"><span className="truncate text-xs text-muted-foreground">{item.label}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(item.value / maxStage) * 100}%` }} /></div><span className="text-right font-mono text-xs">{item.value}</span></div>)}</div> : <EmptyState message="No opportunity data yet." />}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Opportunity sources</CardTitle><CardDescription>Where your tracked roles originated.</CardDescription></CardHeader><CardContent>{sourceData.length ? <div className="space-y-3">{sourceData.map((item) => <div key={item.label} className="grid grid-cols-[130px_1fr_28px] items-center gap-3"><span className="truncate text-xs text-muted-foreground">{item.label}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${(item.value / maxSource) * 100}%` }} /></div><span className="text-right font-mono text-xs">{item.value}</span></div>)}</div> : <EmptyState message="No source data yet." />}</CardContent></Card>
    </section>

    <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.5fr]">
      <Card><CardHeader><CardTitle className="text-base">Execution rate</CardTitle><CardDescription>Completion across every follow-up record.</CardDescription></CardHeader><CardContent><div className="flex items-end justify-between"><p className="text-4xl font-semibold tracking-tight">{percentage(completedFollowUps.length, followUps.length)}%</p><p className="text-xs text-muted-foreground">{completedFollowUps.length} of {followUps.length}</p></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${percentage(completedFollowUps.length, followUps.length)}%` }} /></div><p className="mt-4 text-xs leading-5 text-muted-foreground">This reflects completion discipline, not whether the follow-up produced a response.</p></CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Data quality</CardTitle><CardDescription>Coverage that determines how useful future analytics can become.</CardDescription></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><Coverage label="Fit scores" value={fitScores.length} total={opportunities.length} /><Coverage label="Sources" value={opportunities.filter((item) => item.source).length} total={opportunities.length} /><Coverage label="Applied dates" value={appliedCount} total={opportunities.length} /></CardContent></Card>
    </section>
  </div>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">{message}</div>;
}

function Coverage({ label, value, total }: { label: string; value: number; total: number }) {
  const rate = percentage(value, total);
  return <div className="rounded-lg border bg-muted/10 p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{rate}%</p><p className="mt-1 text-[11px] text-muted-foreground">{value} of {total} records</p></div>;
}
