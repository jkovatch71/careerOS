"use client";

import { useActionState } from "react";
import { BrainCircuit, CheckCircle2, Database, LoaderCircle, TriangleAlert } from "lucide-react";

import {
  parseOpportunityJobDescription,
  type JobParserState,
} from "@/app/(app)/ai/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type OpportunityOption = { id: string; label: string; jobDescription: string | null };
const initialState: JobParserState = {};

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  return <div><h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h4>{items.length ? <ul className="mt-2 space-y-1.5 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Not specified</p>}</div>;
}

export function JobDescriptionParser({ opportunities }: { opportunities: OpportunityOption[] }) {
  const [state, action, pending] = useActionState(parseOpportunityJobDescription, initialState);

  return (
    <div>
      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="opportunity_id">Opportunity</Label>
          <select id="opportunity_id" name="opportunity_id" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            <option value="">Select an opportunity</option>
            {opportunities.map((opportunity) => <option key={opportunity.id} value={opportunity.id}>{opportunity.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_description">Job description</Label>
          <textarea id="job_description" name="job_description" rows={12} required minLength={200} maxLength={30000} placeholder="Paste the complete job description here…" className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
          <p className="text-xs text-muted-foreground">Minimum 200 characters. Analysis runs only when you click the button.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" name="intent" value="analyze" disabled={pending || opportunities.length === 0}>
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <BrainCircuit className="size-4" />}
            {pending ? "Working…" : "Analyze and save"}
          </Button>
          <Button type="submit" name="intent" value="test-storage" formNoValidate variant="outline" disabled={pending || opportunities.length === 0}>
            <Database className="size-4" /> Test database save (no AI)
          </Button>
        </div>
      </form>

      {state.status === "error" ? <div role="alert" className="mt-5 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><TriangleAlert className="mt-0.5 size-4 shrink-0" />{state.message}</div> : null}

      {state.status === "success" && !state.analysis ? <div role="status" className="mt-5 flex gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-300"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{state.message}</div> : null}

      {state.status === "success" && state.analysis ? (
        <div className="mt-6 rounded-xl border bg-muted/10 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-300"><CheckCircle2 className="size-4" />{state.message}</div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2"><h3 className="text-base font-semibold">{state.analysis.seniority}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{state.analysis.executive_summary}</p></div>
            <AnalysisList title="Core responsibilities" items={state.analysis.responsibilities} />
            <AnalysisList title="Required qualifications" items={state.analysis.required_qualifications} />
            <AnalysisList title="Preferred qualifications" items={state.analysis.preferred_qualifications} />
            <AnalysisList title="Leadership signals" items={state.analysis.leadership_signals} />
            <AnalysisList title="Skills" items={state.analysis.skills} />
            <AnalysisList title="Keywords" items={state.analysis.keywords} />
          </div>
          {state.analysis.compensation ? <p className="mt-5 border-t pt-4 text-sm"><span className="text-muted-foreground">Compensation: </span>{state.analysis.compensation}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
