import type { Metadata } from "next";
import Link from "next/link";
import { DatabaseBackup, Download, FileJson, FileSpreadsheet, FileWarning, Upload } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Data & backup" };

const includedRecords = [
  "Companies and company scoring",
  "Contacts and relationships",
  "Opportunities and job descriptions",
  "Outreach and follow-ups",
  "Resume metadata and private storage paths",
  "Saved AI analyses",
];

export default function DataSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-sm text-muted-foreground">Account settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
          Data &amp; backup
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Keep a private, portable copy of the career data stored in your workspace.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DatabaseBackup className="size-4 text-primary" />
            Full workspace backup
          </CardTitle>
          <CardDescription>
            Download a lossless JSON file that preserves record IDs and relationships.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {includedRecords.map((record) => (
              <div key={record} className="flex items-start gap-2 text-sm">
                <FileJson className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{record}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg border bg-muted/15 p-4">
            <FileWarning className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium">Resume file contents are not included</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Uploaded PDF and Word files remain in private Supabase Storage. Their metadata and
                storage paths are included in the backup.
              </p>
            </div>
          </div>

          <a
            href="/settings/data/export"
            download
            className={cn(buttonVariants(), "mt-6")}
          >
            <Download className="size-4" />
            Download JSON backup
          </a>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="size-4 text-primary" />
            Company and contact import
          </CardTitle>
          <CardDescription>
            Build your network from a reviewed CSV instead of entering records individually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/settings/data/import" className={cn(buttonVariants())}>
            <Upload className="size-4" />
            Import companies and contacts
          </Link>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Treat backup files as private. They may contain personal contact details, notes, job
        descriptions, and AI-generated career analysis.
      </p>
    </div>
  );
}
