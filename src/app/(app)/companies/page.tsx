import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ExternalLink, Plus, Search, SlidersHorizontal, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  COMPANY_PRIORITIES,
  COMPANY_STATUSES,
  ORGANIZATION_TYPES,
  companyStatusLabel,
  organizationTypeLabel,
} from "@/features/companies/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Companies" };

const COMPANY_SORTS = [
  { value: "updated_desc", label: "Recently updated" },
  { value: "created_desc", label: "Recently added" },
  { value: "name_asc", label: "Company A–Z" },
  { value: "score_desc", label: "Highest score" },
  { value: "priority_asc", label: "Priority A–C" },
] as const;

type SearchParams = {
  q?: string | string[];
  type?: string | string[];
  status?: string | string[];
  priority?: string | string[];
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

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = safeSearchTerm(firstValue(params.q));
  const requestedType = firstValue(params.type);
  const organizationType = ORGANIZATION_TYPES.some((option) => option.value === requestedType)
    ? requestedType
    : "";
  const requestedStatus = firstValue(params.status);
  const status = COMPANY_STATUSES.some((option) => option.value === requestedStatus)
    ? requestedStatus
    : "";
  const requestedPriority = firstValue(params.priority);
  const priority = COMPANY_PRIORITIES.includes(
    requestedPriority as (typeof COMPANY_PRIORITIES)[number],
  )
    ? requestedPriority
    : "";
  const requestedSort = firstValue(params.sort);
  const sort = COMPANY_SORTS.some((option) => option.value === requestedSort)
    ? requestedSort
    : "updated_desc";
  const hasFilters = Boolean(
    q || organizationType || status || priority || sort !== "updated_desc",
  );

  const supabase = await createClient();
  let query = supabase
    .from("companies")
    .select("*");

  if (q) {
    query = query.or([
      `name.ilike.%${q}%`,
      `industry.ilike.%${q}%`,
      `website.ilike.%${q}%`,
      `notes.ilike.%${q}%`,
    ].join(","));
  }
  if (organizationType) query = query.eq("organization_type", organizationType);
  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  if (sort === "created_desc") {
    query = query.order("created_at", { ascending: false, nullsFirst: false });
  } else if (sort === "name_asc") {
    query = query.order("name", { ascending: true });
  } else if (sort === "score_desc") {
    query = query.order("score", { ascending: false, nullsFirst: false });
  } else if (sort === "priority_asc") {
    query = query.order("priority", { ascending: true, nullsFirst: false })
      .order("score", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("updated_at", { ascending: false, nullsFirst: false });
  }

  const { data: companies, error } = await query;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Relationship intelligence</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Companies</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Build and prioritize employers and recruiting firms in your career market.
          </p>
        </div>
        <Link href="/companies/new" className={cn(buttonVariants())}>
          <Plus className="size-4" /> Add company
        </Link>
      </div>

      <form
        method="get"
        className="mt-8 grid gap-3 rounded-xl border bg-card/40 p-4 xl:grid-cols-[minmax(220px,1fr)_170px_150px_110px_180px_auto]"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search company, industry, website…"
            aria-label="Search companies"
            className="pl-9"
          />
        </div>
        <select
          name="type"
          defaultValue={organizationType}
          aria-label="Filter by organization type"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All organization types</option>
          {ORGANIZATION_TYPES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status}
          aria-label="Filter by company status"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All statuses</option>
          {COMPANY_STATUSES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          name="priority"
          defaultValue={priority}
          aria-label="Filter by company priority"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All priorities</option>
          {COMPANY_PRIORITIES.map((option) => <option key={option}>{option}</option>)}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          aria-label="Sort companies"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {COMPANY_SORTS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit" variant="outline" className="flex-1 xl:flex-none">
            <SlidersHorizontal className="size-4" />
            Apply
          </Button>
          {hasFilters ? (
            <Link
              href="/companies"
              aria-label="Clear company filters"
              title="Clear filters"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <X className="size-4" />
            </Link>
          ) : null}
        </div>
      </form>

      {error ? (
        <Card className="mt-8 border-destructive/40">
          <CardContent className="p-6 text-sm text-destructive">
            Career OS could not load companies. Try refreshing the page.
          </CardContent>
        </Card>
      ) : companies.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <span className="flex size-11 items-center justify-center rounded-lg border bg-muted/30">
              <Building2 className="size-5 text-muted-foreground" />
            </span>
            <h2 className="mt-4 text-sm font-medium">{hasFilters ? "No matching companies" : "No companies yet"}</h2>
            <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
              {hasFilters ? "Adjust or clear the current search and filters." : "Add the first organization you want to research, monitor, or pursue."}
            </p>
            {hasFilters ? (
              <Link href="/companies" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5")}>
                <X className="size-4" /> Clear filters
              </Link>
            ) : (
              <Link href="/companies/new" className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
                <Plus className="size-4" /> Add your first company
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/15 px-5 py-2 text-xs text-muted-foreground">
            {companies.length} compan{companies.length === 1 ? "y" : "ies"}
          </div>
          <div className="hidden grid-cols-[minmax(220px,2fr)_1fr_130px_100px_80px] gap-4 border-b bg-card/70 px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
            <span>Organization</span><span>Type</span><span>Status</span><span>Priority</span><span>Score</span>
          </div>
          <div className="divide-y">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.id}/edit`}
                className="grid gap-3 bg-background px-5 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(220px,2fr)_1fr_130px_100px_80px] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{company.name}</p>
                  {company.website ? (
                    <span className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      {new URL(company.website).hostname.replace(/^www\./, "")}
                      <ExternalLink className="size-3 shrink-0" />
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{organizationTypeLabel(company.organization_type)}</p>
                <span className="w-fit rounded-full border bg-muted/30 px-2 py-1 text-xs">
                  {companyStatusLabel(company.status)}
                </span>
                <span className="text-sm text-muted-foreground">{company.priority ?? "B"}</span>
                <span className="font-mono text-sm">{company.score ?? "—"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
