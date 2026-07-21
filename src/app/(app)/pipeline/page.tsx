import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, LayoutPanelTop, Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { PipelineStageControl } from "@/features/pipeline/pipeline-stage-control";
import { OPPORTUNITY_STAGES } from "@/features/opportunities/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pipeline" };

const ACTIVE_STAGES = OPPORTUNITY_STAGES.slice(0, 7);
const ARCHIVE_STAGES = OPPORTUNITY_STAGES.slice(7);

function formatDueDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const archived = view === "archive";
  const stages = archived ? ARCHIVE_STAGES : ACTIVE_STAGES;
  const stageValues = stages.map((stage) => stage.value);
  const supabase = await createClient();
  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("id, role_title, source, stage, fit_score, next_action, next_action_at, employer:companies!opportunities_company_id_fkey(id, name)")
    .in("stage", stageValues)
    .order("updated_at", { ascending: false, nullsFirst: false });

  return (
    <div className="mx-auto max-w-[1800px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Opportunity workflow</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Pipeline</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Move each role toward its next decision point.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border p-0.5">
            <Link
              href="/pipeline"
              className={cn(buttonVariants({ variant: archived ? "ghost" : "outline", size: "sm" }), !archived && "border-0 bg-muted")}
            >
              Active
            </Link>
            <Link
              href="/pipeline?view=archive"
              className={cn(buttonVariants({ variant: archived ? "outline" : "ghost", size: "sm" }), archived && "border-0 bg-muted")}
            >
              Archive
            </Link>
          </div>
          <Link href="/opportunities/new" className={cn(buttonVariants({ size: "sm" }))}>
            <Plus className="size-4" /> Add opportunity
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-8 rounded-xl border border-destructive/40 p-6 text-sm text-destructive">
          Career OS could not load the pipeline.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto pb-4">
          <div className="flex min-w-max gap-4">
            {stages.map((stage) => {
              const cards = (opportunities ?? []).filter((opportunity) => opportunity.stage === stage.value);

              return (
                <section key={stage.value} aria-labelledby={`stage-${stage.value}`} className="w-72 shrink-0">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 id={`stage-${stage.value}`} className="text-sm font-medium">{stage.label}</h2>
                    <span className="rounded-full border bg-muted/30 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      {cards.length}
                    </span>
                  </div>
                  <div className="min-h-64 space-y-3 rounded-xl border bg-muted/10 p-2.5">
                    {cards.length === 0 ? (
                      <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                        <LayoutPanelTop className="size-4 text-muted-foreground/60" />
                        <p className="mt-2 text-xs text-muted-foreground">No opportunities</p>
                      </div>
                    ) : cards.map((opportunity) => {
                      const dueDate = formatDueDate(opportunity.next_action_at);
                      return (
                        <article key={opportunity.id} className="rounded-lg border bg-card p-3 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/opportunities/${opportunity.id}/edit`}
                                className="block truncate text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {opportunity.role_title}
                              </Link>
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {opportunity.employer?.name ?? "Company not set"}
                              </p>
                            </div>
                            {opportunity.fit_score !== null ? (
                              <span className="rounded border px-1.5 py-0.5 font-mono text-xs">{opportunity.fit_score}</span>
                            ) : null}
                          </div>
                          <div className="mt-3 min-h-10 text-xs text-muted-foreground">
                            <p className="line-clamp-2">{opportunity.next_action ?? "No next action set"}</p>
                            {dueDate ? (
                              <p className="mt-1 flex items-center gap-1"><CalendarClock className="size-3" /> Due {dueDate}</p>
                            ) : null}
                          </div>
                          <div className="mt-3 border-t pt-3">
                            <PipelineStageControl opportunityId={opportunity.id} currentStage={opportunity.stage} />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
