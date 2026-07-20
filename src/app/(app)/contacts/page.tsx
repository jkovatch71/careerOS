import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { contactTypeLabel } from "@/features/contacts/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Contacts" };

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: contacts, error } = await supabase.from("contacts").select("*, companies(id, name)").order("name");

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-sm text-muted-foreground">Career network</p><h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Contacts</h1><p className="mt-2 text-sm text-muted-foreground">Track recruiters, hiring managers, referrals, and advocates.</p></div>
        <Link href="/contacts/new" className={cn(buttonVariants())}><Plus className="size-4" /> Add contact</Link>
      </div>
      {error ? (
        <Card className="mt-8 border-destructive/40"><CardContent className="p-6 text-sm text-destructive">Career OS could not load contacts.</CardContent></Card>
      ) : contacts.length === 0 ? (
        <Card className="mt-8"><CardContent className="flex min-h-72 flex-col items-center justify-center text-center"><span className="flex size-11 items-center justify-center rounded-lg border bg-muted/30"><Users className="size-5 text-muted-foreground" /></span><h2 className="mt-4 text-sm font-medium">No contacts yet</h2><p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">Add a recruiter, hiring manager, or professional relationship.</p><Link href="/contacts/new" className={cn(buttonVariants({ size: "sm" }), "mt-5")}><Plus className="size-4" /> Add your first contact</Link></CardContent></Card>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border">
          <div className="hidden grid-cols-[minmax(200px,1.5fr)_1fr_1fr_1fr] gap-4 border-b bg-card/70 px-5 py-3 text-xs font-medium text-muted-foreground md:grid"><span>Contact</span><span>Relationship</span><span>Organization</span><span>Email</span></div>
          <div className="divide-y">{contacts.map((contact) => (
            <Link key={contact.id} href={`/contacts/${contact.id}/edit`} className="grid gap-3 bg-background px-5 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(200px,1.5fr)_1fr_1fr_1fr] md:items-center md:gap-4">
              <div className="min-w-0"><p className="truncate text-sm font-medium">{contact.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{contact.title ?? "Title not set"}</p></div>
              <span className="w-fit rounded-full border bg-muted/30 px-2 py-1 text-xs">{contactTypeLabel(contact.contact_type)}</span>
              <p className="truncate text-sm text-muted-foreground">{contact.companies?.name ?? "Independent"}</p>
              <p className="truncate text-sm text-muted-foreground">{contact.email ?? "—"}</p>
            </Link>
          ))}</div>
        </div>
      )}
    </div>
  );
}
