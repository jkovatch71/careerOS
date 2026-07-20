import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness, Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { opportunityStageLabel } from "@/features/opportunities/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Opportunities" };

export default async function OpportunitiesPage() {
  const supabase = await createClient();
  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("*, employer:companies!opportunities_company_id_fkey(id, name)")
    .order("updated_at", { ascending: false, nullsFirst: false });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Active search</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Opportunities</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track every role from research through decision.</p>
        </div>
        <Link href="/opportunities/new" className={cn(buttonVariants())}><Plus className="size-4" /> Add opportunity</Link>
      </div>

      {error ? (
        <Card className="mt-8 border-destructive/40"><CardContent className="p-6 text-sm text-destructive">Career OS could not load opportunities.</CardContent></Card>
      ) : opportunities.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <span className="flex size-11 items-center justify-center rounded-lg border bg-muted/30"><BriefcaseBusiness className="size-5 text-muted-foreground" /></span>
            <h2 className="mt-4 text-sm font-medium">No opportunities yet</h2>
            <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">Capture the first role you want to research or pursue.</p>
            <Link href="/opportunities/new" className={cn(buttonVariants({ size: "sm" }), "mt-5")}><Plus className="size-4" /> Add your first opportunity</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border">
          <div className="hidden grid-cols-[minmax(220px,2fr)_1fr_130px_90px_150px] gap-4 border-b bg-card/70 px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
            <span>Role</span><span>Company</span><span>Stage</span><span>Fit</span><span>Next action</span>
          </div>
          <div className="divide-y">
            {opportunities.map((opportunity) => (
              <Link key={opportunity.id} href={`/opportunities/${opportunity.id}/edit`} className="grid gap-3 bg-background px-5 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(220px,2fr)_1fr_130px_90px_150px] md:items-center md:gap-4">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{opportunity.role_title}</p><p className="mt-1 text-xs text-muted-foreground">{opportunity.source ?? "Source not set"}</p></div>
                <p className="truncate text-sm text-muted-foreground">{opportunity.employer?.name ?? "—"}</p>
                <span className="w-fit rounded-full border bg-muted/30 px-2 py-1 text-xs">{opportunityStageLabel(opportunity.stage)}</span>
                <span className="font-mono text-sm">{opportunity.fit_score ?? "—"}</span>
                <p className="truncate text-sm text-muted-foreground">{opportunity.next_action ?? "—"}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
