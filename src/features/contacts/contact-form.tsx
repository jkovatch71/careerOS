"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import { createContact, updateContact, type ContactActionState } from "@/app/(app)/contacts/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Company, Contact } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { CONTACT_TYPES } from "./constants";

const initialState: ContactActionState = {};

export function ContactForm({ companies, contact }: { companies: Pick<Company, "id" | "name">[]; contact?: Contact }) {
  const action = contact ? updateContact.bind(null, contact.id) : createContact;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={contact?.name} autoFocus required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_type">Relationship type</Label>
          <select id="contact_type" name="contact_type" defaultValue={contact?.contact_type ?? "recruiter"} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            {CONTACT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_id">Organization</Label>
          <select id="company_id" name="company_id" defaultValue={contact?.company_id ?? ""} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
            <option value="">Independent / not specified</option>
            {companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={contact?.title ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={contact?.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input id="linkedin_url" name="linkedin_url" type="url" placeholder="https://linkedin.com/in/..." defaultValue={contact?.linkedin_url ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea id="notes" name="notes" rows={4} defaultValue={contact?.notes ?? ""} className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
        </div>
      </div>
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Link href="/contacts" className={cn(buttonVariants({ variant: "ghost" }))}>Cancel</Link>
        <Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}{contact ? "Save changes" : "Create contact"}</Button>
      </div>
    </form>
  );
}
