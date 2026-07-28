import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Download, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyContactImporter } from "@/features/imports/company-contact-importer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Import companies and contacts" };

export default function CompanyContactImportPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/settings/data"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Data &amp; backup
      </Link>

      <div className="mt-5 flex items-end justify-between gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Bulk import</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Companies &amp; contacts
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Build your professional network from a spreadsheet without creating records one at a time.
          </p>
        </div>
        <a
          href="/settings/data/import/template"
          download
          className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
        >
          <Download className="size-4" />
          Download template
        </a>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Review before importing</CardTitle>
          <CardDescription>
            Career OS matches companies by name and contacts by email, LinkedIn URL, or name and company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyContactImporter />
        </CardContent>
      </Card>

      <div className="mt-4 flex items-start gap-3 rounded-lg border bg-muted/15 p-4">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium">Existing records are protected</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Imports create missing records and skip likely duplicates. They never overwrite companies
            or contacts you have already curated.
          </p>
        </div>
      </div>
    </div>
  );
}
