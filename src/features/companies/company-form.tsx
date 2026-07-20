"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Company } from "@/lib/supabase/database.types";
import {
  createCompany,
  updateCompany,
  type CompanyActionState,
} from "@/app/(app)/companies/actions";
import { COMPANY_PRIORITIES, COMPANY_STATUSES, ORGANIZATION_TYPES, REMOTE_POLICIES } from "./constants";

const initialState: CompanyActionState = {};

export function CompanyForm({ company }: { company?: Company }) {
  const action = company ? updateCompany.bind(null, company.id) : createCompany;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Company name</Label>
          <Input id="name" name="name" defaultValue={company?.name} autoFocus required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organization_type">Organization type</Label>
          <select
            id="organization_type"
            name="organization_type"
            defaultValue={company?.organization_type ?? "employer"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {ORGANIZATION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://company.com"
            defaultValue={company?.website ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" name="industry" defaultValue={company?.industry ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee_range">Employee range</Label>
          <Input
            id="employee_range"
            name="employee_range"
            placeholder="1,000–5,000"
            defaultValue={company?.employee_range ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="remote_policy">Remote policy</Label>
          <select
            id="remote_policy"
            name="remote_policy"
            defaultValue={company?.remote_policy ?? ""}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="">Not specified</option>
            {REMOTE_POLICIES.map((policy) => <option key={policy}>{policy}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={company?.status ?? "target"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {COMPANY_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            name="priority"
            defaultValue={company?.priority ?? "B"}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {COMPANY_PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="score">Strategic score</Label>
          <Input
            id="score"
            name="score"
            type="number"
            min={0}
            max={100}
            placeholder="0–100"
            defaultValue={company?.score ?? ""}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={6}
            defaultValue={company?.notes ?? ""}
            className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
      </div>

      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}

      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Link href="/companies" className={cn(buttonVariants({ variant: "ghost" }))}>Cancel</Link>
        <Button type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {company ? "Save changes" : "Create company"}
        </Button>
      </div>
    </form>
  );
}
