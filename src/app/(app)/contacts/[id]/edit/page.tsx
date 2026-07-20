import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/features/contacts/contact-form";
import { DeleteContactButton } from "@/features/contacts/delete-contact-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit contact" };

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: contact }, { data: companies }] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", id).maybeSingle(),
    supabase.from("companies").select("id, name").order("name"),
  ]);
  if (!contact) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-4"><Link href="/contacts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Contacts</Link><DeleteContactButton contactId={contact.id} contactName={contact.name} /></div>
      <Card className="mt-5"><CardHeader><CardTitle>{contact.name}</CardTitle><CardDescription>Update relationship and contact intelligence.</CardDescription></CardHeader><CardContent><ContactForm companies={companies ?? []} contact={contact} /></CardContent></Card>
    </div>
  );
}
