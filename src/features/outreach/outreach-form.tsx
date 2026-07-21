"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { createOutreach, updateOutreach, type OutreachActionState } from "@/app/(app)/outreach/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact, Opportunity, Outreach } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";
import { OUTREACH_CHANNELS, OUTREACH_OUTCOMES } from "./constants";

const initialState: OutreachActionState = {};
function dateTimeValue(value: string | null) { return value ? new Date(value).toISOString().slice(0, 16) : ""; }

export function OutreachForm({ opportunities, contacts, outreach }: {
  opportunities: Pick<Opportunity, "id" | "role_title">[];
  contacts: Pick<Contact, "id" | "name">[];
  outreach?: Outreach;
}) {
  const action = outreach ? updateOutreach.bind(null, outreach.id) : createOutreach;
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="opportunity_id">Opportunity</Label><select id="opportunity_id" name="opportunity_id" defaultValue={outreach?.opportunity_id ?? ""} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Not linked</option>{opportunities.map((item) => <option key={item.id} value={item.id}>{item.role_title}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="contact_id">Contact</Label><select id="contact_id" name="contact_id" defaultValue={outreach?.contact_id ?? ""} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Not linked</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="channel">Channel</Label><select id="channel" name="channel" defaultValue={outreach?.channel ?? ""} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Not specified</option>{OUTREACH_CHANNELS.map((channel) => <option key={channel}>{channel}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="outcome">Outcome</Label><select id="outcome" name="outcome" defaultValue={outreach?.outcome ?? ""} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Pending</option>{OUTREACH_OUTCOMES.map((outcome) => <option key={outcome.value} value={outcome.value}>{outcome.label}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="sent_at">Sent at</Label><Input id="sent_at" name="sent_at" type="datetime-local" defaultValue={dateTimeValue(outreach?.sent_at ?? null)} /></div>
      <div className="space-y-2"><Label htmlFor="response_at">Response at</Label><Input id="response_at" name="response_at" type="datetime-local" defaultValue={dateTimeValue(outreach?.response_at ?? null)} /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="message">Message or interaction notes</Label><textarea id="message" name="message" rows={5} defaultValue={outreach?.message ?? ""} placeholder="Capture the message, call notes, or conversation summary." className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" /></div>
    </div>
    {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
    <div className="flex justify-end gap-3 border-t pt-5"><Link href="/outreach" className={cn(buttonVariants({ variant: "ghost" }))}>Cancel</Link><Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}{outreach ? "Save changes" : "Log outreach"}</Button></div>
  </form>;
}
