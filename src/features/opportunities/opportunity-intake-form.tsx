"use client";

import { useActionState, useState } from "react";
import { BrainCircuit, ClipboardPaste, FileUp, Link2, LoaderCircle, PenLine, RotateCcw } from "lucide-react";

import {
  analyzeOpportunityIntake,
  type OpportunityIntakeState,
} from "@/app/(app)/opportunities/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Company, Contact } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { OpportunityForm } from "./opportunity-form";

const initialState: OpportunityIntakeState = {};

type IntakeMode = "url" | "paste" | "pdf" | "manual";

export function OpportunityIntakeForm({
  companies,
  contacts,
}: {
  companies: Pick<Company, "id" | "name" | "organization_type">[];
  contacts: Pick<Contact, "id" | "name" | "company_id" | "contact_type">[];
}) {
  const [mode, setMode] = useState<IntakeMode>("url");
  const [pdfName, setPdfName] = useState<string>();
  const [state, action, pending] = useActionState(analyzeOpportunityIntake, initialState);

  if (state.status === "success" && state.draft) {
    return (
      <div>
        <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div>
            <p className="text-sm font-medium text-emerald-400">AI draft ready for review</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Nothing has been saved yet. Correct any extracted details, then create the opportunity.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <RotateCcw className="size-4" />
            Start over
          </Button>
        </div>
        <OpportunityForm
          companies={companies}
          contacts={contacts}
          draft={state.draft}
          cancelHref="/opportunities"
        />
      </div>
    );
  }

  if (mode === "manual") {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border bg-muted/15 p-4">
          <div>
            <p className="text-sm font-medium">Manual opportunity</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use this for confidential leads or incomplete postings. Company is optional.
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setMode("url")}>
            Use guided intake
          </Button>
        </div>
        <OpportunityForm companies={companies} contacts={contacts} />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted/35 p-1">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm transition-colors",
            mode === "url" ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Link2 className="size-4" />
          Job link
        </button>
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm transition-colors",
            mode === "paste" ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ClipboardPaste className="size-4" />
          Paste posting
        </button>
        <button
          type="button"
          onClick={() => setMode("pdf")}
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm transition-colors",
            mode === "pdf" ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <FileUp className="size-4" />
          Upload PDF
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className="flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <PenLine className="size-4" />
          Manual
        </button>
      </div>

      <form action={action} className="mt-6 space-y-5">
        <input type="hidden" name="input_mode" value={mode} />
        {mode === "url" || mode === "paste" ? (
          <div className="space-y-2">
            <Label htmlFor="intake_job_url">
              Job posting URL {mode === "paste" ? <span className="font-normal text-muted-foreground">(optional)</span> : null}
            </Label>
            <Input
              id="intake_job_url"
              name="job_url"
              type="url"
              placeholder="https://..."
              required={mode === "url"}
              autoFocus={mode === "url"}
            />
            {mode === "url" ? (
              <p className="text-xs leading-5 text-muted-foreground">
                Career OS will attempt to read the public page. LinkedIn, Workday, and some other sites may require you to paste the posting instead.
              </p>
            ) : null}
          </div>
        ) : (
          <input type="hidden" name="job_url" value="" />
        )}

        {mode === "paste" ? (
          <div className="space-y-2">
            <Label htmlFor="intake_job_description">Full job posting</Label>
            <textarea
              id="intake_job_description"
              name="job_description"
              rows={14}
              required
              minLength={200}
              maxLength={30000}
              autoFocus
              placeholder="Paste the complete job posting here…"
              className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <p className="text-xs text-muted-foreground">
              The original posting will be stored separately from your personal notes.
            </p>
          </div>
        ) : mode === "pdf" ? (
          <div className="space-y-2">
            <Label htmlFor="job_description_pdf">Job-description PDF</Label>
            <input
              id="job_description_pdf"
              name="job_description_pdf"
              type="file"
              accept=".pdf,application/pdf"
              required
              autoFocus
              onChange={(event) => setPdfName(event.target.files?.[0]?.name)}
              className="peer sr-only"
            />
            <label
              htmlFor="job_description_pdf"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 px-4 py-7 text-center transition-colors hover:border-primary/50 hover:bg-muted/20 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
            >
              <span className="flex size-10 items-center justify-center rounded-lg border bg-background">
                <FileUp className="size-4 text-primary" />
              </span>
              <span className="mt-3 text-sm font-medium">
                {pdfName ?? "Choose a recruiter job-description PDF"}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {pdfName ? "Choose another file" : "Text-based PDF · Maximum 3 MB"}
              </span>
            </label>
            <p className="text-xs leading-5 text-muted-foreground">
              The PDF is read securely for this draft and is not retained. Scanned image-only PDFs are not supported.
            </p>
          </div>
        ) : (
          <input type="hidden" name="job_description" value="" />
        )}
        {mode === "pdf" ? <input type="hidden" name="job_description" value="" /> : null}

        {state.status === "error" ? (
          <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {state.message}
          </p>
        ) : null}

        <div className="flex justify-end border-t pt-5">
          <Button type="submit" disabled={pending}>
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <BrainCircuit className="size-4" />}
            {pending ? "Reading and analyzing…" : "Create review draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
