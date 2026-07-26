import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpportunityIntakeForm } from "@/features/opportunities/opportunity-intake-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "New opportunity" };

export default async function NewOpportunityPage() {
  const supabase = await createClient();
  const [{ data: companies }, { data: contacts }] = await Promise.all([
    supabase.from("companies").select("id, name, organization_type").order("name"),
    supabase.from("contacts").select("id, name, company_id, contact_type").order("name"),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/opportunities" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Opportunities</Link>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>New opportunity</CardTitle>
          <CardDescription>Start with a job link or pasted posting, then review the AI-extracted details before anything is saved.</CardDescription>
        </CardHeader>
        <CardContent><OpportunityIntakeForm companies={companies ?? []} contacts={contacts ?? []} /></CardContent>
      </Card>
    </div>
  );
}
