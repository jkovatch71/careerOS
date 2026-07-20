import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/features/contacts/contact-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "New contact" };

export default async function NewContactPage() {
  const supabase = await createClient();
  const { data: companies } = await supabase.from("companies").select("id, name").order("name");
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/contacts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Contacts</Link>
      <Card className="mt-5"><CardHeader><CardTitle>New contact</CardTitle><CardDescription>Add someone to your career network.</CardDescription></CardHeader><CardContent><ContactForm companies={companies ?? []} /></CardContent></Card>
    </div>
  );
}
