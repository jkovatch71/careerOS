"use client";

import { useRef, useState, useTransition } from "react";
import { CheckCircle2, FileSpreadsheet, LoaderCircle, Upload, X } from "lucide-react";
import Papa from "papaparse";

import { importCompanyContacts, type ImportResult } from "@/app/(app)/settings/data/import/actions";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  COMPANY_CONTACT_IMPORT_HEADERS,
  type CompanyContactImportRow,
} from "@/features/imports/company-contact-import";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

function emptyResult() {
  return undefined as ImportResult | undefined;
}

export function CompanyContactImporter() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CompanyContactImportRow[]>([]);
  const [pastedData, setPastedData] = useState("");
  const [fileName, setFileName] = useState<string>();
  const [parseError, setParseError] = useState<string>();
  const [result, setResult] = useState<ImportResult | undefined>(emptyResult);
  const [pending, startTransition] = useTransition();

  function parseCsv(csv: string, sourceName: string) {
    setParseError(undefined);
    setResult(undefined);

    const parsed = Papa.parse<Record<string, unknown>>(csv, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim().toLocaleLowerCase("en-US"),
    });

    const firstError = parsed.errors[0];
    if (firstError) {
      setRows([]);
      setParseError(
        `CSV row ${typeof firstError.row === "number" ? firstError.row + 2 : "unknown"}: ${firstError.message}`,
      );
      return;
    }

    const fields = new Set(parsed.meta.fields ?? []);
    const missingHeaders = COMPANY_CONTACT_IMPORT_HEADERS.filter((header) => !fields.has(header));
    if (missingHeaders.length) {
      setRows([]);
      setParseError(`Missing template column${missingHeaders.length === 1 ? "" : "s"}: ${missingHeaders.join(", ")}`);
      return;
    }

    const normalizedRows = parsed.data.map((row) =>
      Object.fromEntries(
        COMPANY_CONTACT_IMPORT_HEADERS.map((header) => [
          header,
          typeof row[header] === "string" ? row[header].trim() : "",
        ]),
      ),
    ) as CompanyContactImportRow[];

    if (!normalizedRows.length) {
      setRows([]);
      setParseError("The CSV does not contain any data rows.");
      return;
    }

    setRows(normalizedRows);
    setFileName(sourceName);
  }

  async function chooseFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setParseError("Choose a CSV smaller than 2 MB.");
      return;
    }
    if (!file.name.toLocaleLowerCase("en-US").endsWith(".csv")) {
      setParseError("Choose a .csv file.");
      return;
    }
    parseCsv(await file.text(), file.name);
  }

  function clearFile() {
    setRows([]);
    setFileName(undefined);
    setParseError(undefined);
    setResult(undefined);
    if (fileInput.current) fileInput.current.value = "";
  }

  function importRows() {
    startTransition(async () => {
      setResult(await importCompanyContacts(rows));
    });
  }

  const companyCount = new Set(
    rows.map((row) => row.company_name.trim().toLocaleLowerCase("en-US")).filter(Boolean),
  ).size;
  const contactCount = rows.filter((row) => row.contact_name.trim()).length;
  const completed = result && !result.error;

  return (
    <div className="space-y-5">
      {!rows.length ? (
        <div className="space-y-5">
          <button
            type="button"
            className="flex min-h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed bg-muted/10 px-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => fileInput.current?.click()}
          >
            <span className="flex size-11 items-center justify-center rounded-lg border bg-background">
              <Upload className="size-5 text-primary" />
            </span>
            <span className="mt-4 text-sm font-medium">Choose a company and contact CSV</span>
            <span className="mt-2 text-xs text-muted-foreground">
              Use the Career OS template · Maximum 500 rows and 2 MB
            </span>
          </button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or paste from a spreadsheet
            <span className="h-px flex-1 bg-border" />
          </div>

          <div>
            <label htmlFor="pasted-import-data" className="text-sm font-medium">
              Spreadsheet rows
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Copy the template headers and rows from Excel or Google Sheets, then paste them here.
            </p>
            <textarea
              id="pasted-import-data"
              rows={6}
              value={pastedData}
              onChange={(event) => setPastedData(event.target.value)}
              placeholder="company_name&#9;organization_type&#9;company_website…"
              className="mt-3 w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={!pastedData.trim()}
                onClick={() => parseCsv(pastedData, "Pasted spreadsheet rows")}
              >
                Preview pasted rows
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/10 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <FileSpreadsheet className="size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {companyCount} unique compan{companyCount === 1 ? "y" : "ies"} · {contactCount} contact{contactCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label="Remove CSV" onClick={clearFile} disabled={pending}>
              <X className="size-4" />
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Row</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Organization</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, index) => (
                    <tr key={`${index}-${row.company_name}-${row.contact_name}`}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{index + 2}</td>
                      <td className="max-w-52 truncate px-4 py-3 font-medium">{row.company_name || <span className="text-destructive">Missing</span>}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.organization_type || "Employer"}</td>
                      <td className="max-w-48 truncate px-4 py-3">{row.contact_name || "—"}</td>
                      <td className="max-w-52 truncate px-4 py-3 text-muted-foreground">{row.contact_title || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.contact_type || "Other"}</td>
                      <td className="max-w-56 truncate px-4 py-3 text-muted-foreground">{row.contact_email || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button type="button" onClick={importRows} disabled={pending || Boolean(completed)}>
              {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {pending ? "Importing…" : "Import reviewed rows"}
            </Button>
          </div>
        </>
      )}

      <input
        ref={fileInput}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(event) => void chooseFile(event.target.files?.[0])}
      />

      {parseError ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {parseError}
        </p>
      ) : null}
      {result?.error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {result.error}
        </p>
      ) : null}
      {completed ? (
        <div role="status" className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Import complete</p>
            <p className="mt-1 text-xs leading-5">
              Created {result.createdCompanies} companies and {result.createdContacts} contacts.
              Matched {result.matchedCompanies} existing companies and skipped {result.skippedContacts} duplicate contacts.
            </p>
            <div className="mt-3 flex gap-4">
              <a href="/companies" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-emerald-500/30")}>
                View companies
              </a>
              <a href="/contacts" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-emerald-500/30")}>
                View contacts
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
