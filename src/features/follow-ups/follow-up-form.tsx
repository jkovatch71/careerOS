"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { createFollowUp, updateFollowUp, type FollowUpActionState } from "@/app/(app)/follow-ups/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { DateTimeInput } from "@/components/ui/date-time-input";
import { Label } from "@/components/ui/label";
import type { Contact, FollowUp, Opportunity } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { FOLLOW_UP_TYPES } from "./constants";

const initialState: FollowUpActionState = {};
function dateTimeValue(value: string | null) { return value ? new Date(value).toISOString().slice(0, 16) : ""; }

export function FollowUpForm({ opportunities, contacts, followUp }: { opportunities: Pick<Opportunity, "id" | "role_title">[]; contacts: Pick<Contact, "id" | "name">[]; followUp?: FollowUp }) {
  const action = followUp ? updateFollowUp.bind(null, followUp.id) : createFollowUp;
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">
    <div className="space-y-2"><Label htmlFor="follow_up_type">Follow-up type</Label><select id="follow_up_type" name="follow_up_type" defaultValue={followUp?.follow_up_type ?? "Email"} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30">{FOLLOW_UP_TYPES.map((type) => <option key={type}>{type}</option>)}</select></div>
    <div className="space-y-2"><Label htmlFor="status">Status</Label><select id="status" name="status" defaultValue={followUp?.status ?? "pending"} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="pending">Pending</option><option value="completed">Completed</option></select></div>
    <div className="space-y-2"><Label htmlFor="opportunity_id">Opportunity</Label><select id="opportunity_id" name="opportunity_id" defaultValue={followUp?.opportunity_id ?? ""} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Not linked</option>{opportunities.map((item) => <option key={item.id} value={item.id}>{item.role_title}</option>)}</select></div>
    <div className="space-y-2"><Label htmlFor="contact_id">Contact</Label><select id="contact_id" name="contact_id" defaultValue={followUp?.contact_id ?? ""} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Not linked</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</select></div>
    <div className="space-y-2 sm:col-span-2"><Label htmlFor="due_at">Due at</Label><DateTimeInput id="due_at" name="due_at" defaultValue={dateTimeValue(followUp?.due_at ?? null)} /></div>
    <div className="space-y-2 sm:col-span-2"><Label htmlFor="notes">Notes</Label><textarea id="notes" name="notes" rows={4} defaultValue={followUp?.notes ?? ""} placeholder="What needs to happen next?" className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" /></div>
  </div>{state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}<div className="flex justify-end gap-3 border-t pt-5"><Link href="/follow-ups" className={cn(buttonVariants({ variant: "ghost" }))}>Cancel</Link><Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}{followUp ? "Save changes" : "Create follow-up"}</Button></div></form>;
}
