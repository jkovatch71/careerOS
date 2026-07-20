import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ExternalLink, Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { companyStatusLabel, organizationTypeLabel } from "@/features/companies/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("updated_at", { ascending: false, nullsFirst: false });

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
            <h2 className="mt-4 text-sm font-medium">No companies yet</h2>
            <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
              Add the first organization you want to research, monitor, or pursue.
            </p>
            <Link href="/companies/new" className={cn(buttonVariants({ size: "sm" }), "mt-5")}>
              <Plus className="size-4" /> Add your first company
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border">
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
