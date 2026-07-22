import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, CalendarClock, CheckCircle2, Target, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OPPORTUNITY_STAGES } from "@/features/opportunities/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

const ACTIVE_STAGE_VALUES = OPPORTUNITY_STAGES.slice(0, 7).map((stage) => stage.value);

function greetingForChicago(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "America/Chicago" }).format(now));
  if (hour < 12) return "Good morning.";
  if (hour < 17) return "Good afternoon.";
  return "Good evening.";
}

function relativeDue(value: string, now: number) {
  const difference = new Date(value).getTime() - now;
  if (difference < 0) {
    const hours = Math.max(1, Math.ceil(Math.abs(difference) / 3_600_000));
    return hours < 24 ? `${hours}h overdue` : `${Math.ceil(hours / 24)}d overdue`;
  }
  const hours = Math.ceil(difference / 3_600_000);
  return hours < 24 ? `Due in ${Math.max(1, hours)}h` : `Due in ${Math.ceil(hours / 24)}d`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const [opportunityResult, followUpResult, contactResult] = await Promise.all([
    supabase.from("opportunities").select("id, role_title, stage, next_action, next_action_at, updated_at, employer:companies!opportunities_company_id_fkey(name)").order("updated_at", { ascending: false, nullsFirst: false }),
    supabase.from("follow_ups").select("id, follow_up_type, due_at, notes, status, opportunity:opportunities(id, role_title), contact:contacts(id, name)").eq("status", "pending").order("due_at", { ascending: true }),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
  ]);

  // A request-time snapshot keeps every urgency calculation consistent for this render.
  const nowDate = new Date();
  const now = nowDate.getTime();
  const opportunities = opportunityResult.data ?? [];
  const followUps = followUpResult.data ?? [];
  const activeOpportunities = opportunities.filter((item) => ACTIVE_STAGE_VALUES.includes(item.stage as (typeof ACTIVE_STAGE_VALUES)[number]));
  const overdueFollowUps = followUps.filter((item) => new Date(item.due_at).getTime() < now);
  const staleThreshold = now - 7 * 24 * 60 * 60 * 1000;
  const staleOpportunities = activeOpportunities.filter((item) => !item.updated_at || new Date(item.updated_at).getTime() < staleThreshold);

  const pipeline = OPPORTUNITY_STAGES.slice(0, 7).map((stage) => ({
    ...stage,
    count: activeOpportunities.filter((item) => item.stage === stage.value).length,
  }));
  const maxStageCount = Math.max(1, ...pipeline.map((stage) => stage.count));

  const opportunityActions = activeOpportunities
    .filter((item) => item.next_action && item.next_action_at)
    .map((item) => ({
      id: `opportunity-${item.id}`,
      title: item.next_action as string,
      context: `${item.role_title}${item.employer?.name ? ` — ${item.employer.name}` : ""}`,
      dueAt: item.next_action_at as string,
      href: `/opportunities/${item.id}/edit`,
    }));
  const followUpActions = followUps.map((item) => ({
    id: `follow-up-${item.id}`,
    title: item.follow_up_type ?? "Follow-up",
    context: item.contact?.name ?? item.opportunity?.role_title ?? item.notes ?? "Unlinked follow-up",
    dueAt: item.due_at,
    href: `/follow-ups/${item.id}/edit`,
  }));
  const priorityActions = [...followUpActions, ...opportunityActions]
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 5);

  const metrics = [
    { label: "Active opportunities", value: activeOpportunities.length, icon: Target },
    { label: "Relationships", value: contactResult.count ?? 0, icon: Users },
    { label: "Follow-ups overdue", value: overdueFollowUps.length, icon: CalendarClock },
  ];
  const hasLoadError = Boolean(opportunityResult.error || followUpResult.error || contactResult.error);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Daily executive briefing</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{greetingForChicago(nowDate)}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Your current pipeline, relationship commitments, and next decisions.</p>
        </div>
        <div className="rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
          {nowDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" })}
        </div>
      </div>

      {hasLoadError ? <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">Some dashboard data could not be loaded. Refresh the page to try again.</div> : null}

      <section aria-label="Career metrics" className="mt-8 grid gap-4 md:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => <Card key={label}><CardHeader className="flex-row items-center justify-between pb-2"><CardDescription>{label}</CardDescription><Icon className="size-4 text-muted-foreground" /></CardHeader><CardContent><p className="text-3xl font-semibold tracking-tight">{value}</p></CardContent></Card>)}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader><CardTitle className="text-base">Executive briefing</CardTitle><CardDescription>Deterministic priorities from your live Career OS data.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/15 p-4"><AlertCircle className={`mt-0.5 size-4 shrink-0 ${overdueFollowUps.length ? "text-destructive" : "text-emerald-400"}`} /><div><p className="text-sm font-medium">{overdueFollowUps.length ? `${overdueFollowUps.length} overdue follow-up${overdueFollowUps.length === 1 ? "" : "s"}` : "Follow-ups are current"}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{overdueFollowUps.length ? "Clear the oldest relationship commitments first." : "No pending relationship commitments are past due."}</p></div></div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/15 p-4"><Target className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-medium">{activeOpportunities.length} active opportunit{activeOpportunities.length === 1 ? "y" : "ies"}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{activeOpportunities.length ? `${pipeline.filter((stage) => stage.count > 0).length} active pipeline stage${pipeline.filter((stage) => stage.count > 0).length === 1 ? "" : "s"} represented.` : "Add a target role to begin building the pipeline."}</p></div></div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/15 p-4"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><div><p className="text-sm font-medium">{staleOpportunities.length ? `${staleOpportunities.length} opportunit${staleOpportunities.length === 1 ? "y needs" : "ies need"} attention` : "Pipeline records are current"}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{staleOpportunities.length ? "These active records have not been updated in seven days." : "Every active opportunity has been updated within seven days."}</p></div></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Priority actions</CardTitle><CardDescription>Your earliest dated commitments.</CardDescription></CardHeader>
          <CardContent>
            {priorityActions.length ? <div className="divide-y">{priorityActions.map((item) => { const overdue = new Date(item.dueAt).getTime() < now; return <Link key={item.id} href={item.href} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><ArrowUpRight className="mt-0.5 size-4 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.context}</p></div><span className={`shrink-0 text-[11px] ${overdue ? "text-destructive" : "text-muted-foreground"}`}>{relativeDue(item.dueAt, now)}</span></Link>; })}</div> : <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center"><CheckCircle2 className="size-5 text-emerald-400" /><p className="mt-3 text-sm font-medium">No dated actions pending</p><p className="mt-1 text-xs text-muted-foreground">Your immediate queue is clear.</p></div>}
          </CardContent>
        </Card>
      </section>

      <Card className="mt-4">
        <CardHeader className="flex-row items-start justify-between"><div><CardTitle className="text-base">Pipeline distribution</CardTitle><CardDescription className="mt-1">Active opportunities by decision stage.</CardDescription></div><Link href="/pipeline" className="text-xs font-medium text-primary hover:underline">Open pipeline</Link></CardHeader>
        <CardContent>
          {activeOpportunities.length ? <div className="space-y-3">{pipeline.map((stage) => <div key={stage.value} className="grid grid-cols-[120px_1fr_28px] items-center gap-3"><span className="text-xs text-muted-foreground">{stage.label}</span><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(stage.count / maxStageCount) * 100}%` }} /></div><span className="text-right font-mono text-xs">{stage.count}</span></div>)}</div> : <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed text-center"><Target className="size-5 text-muted-foreground" /><p className="mt-3 text-sm font-medium">No active opportunities</p><Link href="/opportunities/new" className="mt-2 text-xs font-medium text-primary hover:underline">Add an opportunity</Link></div>}
        </CardContent>
      </Card>
    </div>
  );
}
