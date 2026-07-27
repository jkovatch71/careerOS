import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness, Plus, Search, SlidersHorizontal, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  OPPORTUNITY_SOURCES,
  OPPORTUNITY_STAGES,
  opportunityStageLabel,
} from "@/features/opportunities/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Opportunities" };

const OPPORTUNITY_SORTS = [
  { value: "updated_desc", label: "Recently updated" },
  { value: "created_desc", label: "Recently added" },
  { value: "role_asc", label: "Role A–Z" },
  { value: "fit_desc", label: "Highest fit score" },
] as const;

type SearchParams = {
  q?: string | string[];
  stage?: string | string[];
  source?: string | string[];
  sort?: string | string[];
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function safeSearchTerm(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s.&'’-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = safeSearchTerm(firstValue(params.q));
  const requestedStage = firstValue(params.stage);
  const stage = OPPORTUNITY_STAGES.some((option) => option.value === requestedStage)
    ? requestedStage
    : "";
  const requestedSource = firstValue(params.source);
  const source = OPPORTUNITY_SOURCES.includes(
    requestedSource as (typeof OPPORTUNITY_SOURCES)[number],
  )
    ? requestedSource
    : "";
  const requestedSort = firstValue(params.sort);
  const sort = OPPORTUNITY_SORTS.some((option) => option.value === requestedSort)
    ? requestedSort
    : "updated_desc";
  const hasFilters = Boolean(q || stage || source || sort !== "updated_desc");

  const supabase = await createClient();
  let matchingCompanyIds: string[] = [];
  if (q) {
    const { data: matchingCompanies } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", `%${q}%`);
    matchingCompanyIds = (matchingCompanies ?? []).map((company) => company.id);
  }

  let query = supabase
    .from("opportunities")
    .select("*, employer:companies!opportunities_company_id_fkey(id, name)");

  if (stage) query = query.eq("stage", stage);
  if (source) query = query.eq("source", source);
  if (q) {
    const searchFilters = [
      `role_title.ilike.%${q}%`,
      `source.ilike.%${q}%`,
      `next_action.ilike.%${q}%`,
    ];
    if (matchingCompanyIds.length) {
      searchFilters.push(`company_id.in.(${matchingCompanyIds.join(",")})`);
    }
    query = query.or(searchFilters.join(","));
  }

  if (sort === "created_desc") {
    query = query.order("created_at", { ascending: false, nullsFirst: false });
  } else if (sort === "role_asc") {
    query = query.order("role_title", { ascending: true });
  } else if (sort === "fit_desc") {
    query = query.order("fit_score", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("updated_at", { ascending: false, nullsFirst: false });
  }

  const { data: opportunities, error } = await query;

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

      <form
        method="get"
        className="mt-8 grid gap-3 rounded-xl border bg-card/40 p-4 lg:grid-cols-[minmax(240px,1fr)_180px_180px_190px_auto]"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search role, company, source…"
            aria-label="Search opportunities"
            className="pl-9"
          />
        </div>
        <select
          name="stage"
          defaultValue={stage}
          aria-label="Filter by stage"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All stages</option>
          {OPPORTUNITY_STAGES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          name="source"
          defaultValue={source}
          aria-label="Filter by source"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All sources</option>
          {OPPORTUNITY_SOURCES.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          aria-label="Sort opportunities"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {OPPORTUNITY_SORTS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit" variant="outline" className="flex-1 lg:flex-none">
            <SlidersHorizontal className="size-4" />
            Apply
          </Button>
          {hasFilters ? (
            <Link
              href="/opportunities"
              aria-label="Clear opportunity filters"
              title="Clear filters"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <X className="size-4" />
            </Link>
          ) : null}
        </div>
      </form>

      {error ? (
        <Card className="mt-8 border-destructive/40"><CardContent className="p-6 text-sm text-destructive">Career OS could not load opportunities.</CardContent></Card>
      ) : opportunities.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <span className="flex size-11 items-center justify-center rounded-lg border bg-muted/30"><BriefcaseBusiness className="size-5 text-muted-foreground" /></span>
            <h2 className="mt-4 text-sm font-medium">{hasFilters ? "No matching opportunities" : "No opportunities yet"}</h2>
            <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
              {hasFilters ? "Adjust or clear the current search and filters." : "Capture the first role you want to research or pursue."}
            </p>
            {hasFilters ? (
              <Link href="/opportunities" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5")}><X className="size-4" /> Clear filters</Link>
            ) : (
              <Link href="/opportunities/new" className={cn(buttonVariants({ size: "sm" }), "mt-5")}><Plus className="size-4" /> Add your first opportunity</Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/15 px-5 py-2 text-xs text-muted-foreground">
            {opportunities.length} opportunit{opportunities.length === 1 ? "y" : "ies"}
          </div>
          <div className="hidden grid-cols-[minmax(220px,2fr)_1fr_130px_90px_150px] gap-4 border-b bg-card/70 px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
            <span>Role</span><span>Company</span><span>Stage</span><span>Fit</span><span>Next action</span>
          </div>
          <div className="divide-y">
            {opportunities.map((opportunity) => (
              <Link key={opportunity.id} href={`/opportunities/${opportunity.id}`} className="grid gap-3 bg-background px-5 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(220px,2fr)_1fr_130px_90px_150px] md:items-center md:gap-4">
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
