"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { createOpportunity, updateOpportunity, type OpportunityActionState } from "@/app/(app)/opportunities/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Company, Contact, Opportunity } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { OPPORTUNITY_SOURCES, OPPORTUNITY_STAGES } from "./constants";

const initialState: OpportunityActionState = {};

function dateTimeValue(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

export function OpportunityForm({
  companies,
  contacts,
  opportunity,
}: {
  companies: Pick<Company, "id" | "name" | "organization_type">[];
  contacts: Pick<Contact, "id" | "name" | "company_id" | "contact_type">[];
  opportunity?: Opportunity;
}) {
  const action = opportunity
    ? updateOpportunity.bind(null, opportunity.id)
    : createOpportunity;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [recruitingFirmId, setRecruitingFirmId] = useState(opportunity?.recruiting_firm_id ?? "");
  const employers = companies.filter((company) => ["employer", "both"].includes(company.organization_type));
  const firms = companies.filter((company) => ["recruiting_firm", "both"].includes(company.organization_type));
  const recruiters = contacts.filter((contact) =>
    ["recruiter", "talent_acquisition"].includes(contact.contact_type ?? "")
    && (!recruitingFirmId || contact.company_id === recruitingFirmId),
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_id">Company</Label>
          <select
            id="company_id"
            name="company_id"
            defaultValue={opportunity?.company_id ?? ""}
            required
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="" disabled>Select a company</option>
            {employers.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role_title">Role title</Label>
          <Input id="role_title" name="role_title" defaultValue={opportunity?.role_title} required autoFocus />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="job_url">Job posting URL</Label>
          <Input id="job_url" name="job_url" type="url" placeholder="https://..." defaultValue={opportunity?.job_url ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recruiting_firm_id">Recruiting firm</Label>
          <select
            id="recruiting_firm_id"
            name="recruiting_firm_id"
            value={recruitingFirmId}
            onChange={(event) => setRecruitingFirmId(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="">Direct opportunity</option>
            {firms.map((firm) => <option key={firm.id} value={firm.id}>{firm.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recruiter_contact_id">Primary recruiter</Label>
          <select
            id="recruiter_contact_id"
            name="recruiter_contact_id"
            key={recruitingFirmId}
            defaultValue={opportunity?.recruiter_contact_id ?? ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="">Not specified</option>
            {recruiters.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <select
            id="source"
            name="source"
            defaultValue={opportunity?.source ?? ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="">Not specified</option>
            {OPPORTUNITY_SOURCES.map((source) => <option key={source}>{source}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <select
            id="stage"
            name="stage"
            defaultValue={opportunity?.stage ?? "research"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {OPPORTUNITY_STAGES.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="compensation">Compensation</Label>
          <Input id="compensation" name="compensation" placeholder="$150k–$180k" defaultValue={opportunity?.compensation ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fit_score">Fit score</Label>
          <Input id="fit_score" name="fit_score" type="number" min={0} max={100} placeholder="0–100" defaultValue={opportunity?.fit_score ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="applied_at">Applied at</Label>
          <Input id="applied_at" name="applied_at" type="datetime-local" defaultValue={dateTimeValue(opportunity?.applied_at ?? null)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next_action_at">Next action due</Label>
          <Input id="next_action_at" name="next_action_at" type="datetime-local" defaultValue={dateTimeValue(opportunity?.next_action_at ?? null)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="next_action">Next action</Label>
          <Input id="next_action" name="next_action" placeholder="Follow up with recruiter" defaultValue={opportunity?.next_action ?? ""} />
        </div>
        <div className="flex flex-wrap gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="promoted_by_hirer" defaultChecked={opportunity?.promoted_by_hirer ?? false} className="size-4 accent-primary" />
            Promoted by hiring team
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="easy_apply" defaultChecked={opportunity?.easy_apply ?? false} className="size-4 accent-primary" />
            Easy Apply
          </label>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea id="notes" name="notes" rows={3} defaultValue={opportunity?.notes ?? ""} className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
        </div>
      </div>

      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}

      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Link href="/opportunities" className={cn(buttonVariants({ variant: "ghost" }))}>Cancel</Link>
        <Button type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {opportunity ? "Save changes" : "Create opportunity"}
        </Button>
      </div>
    </form>
  );
}
