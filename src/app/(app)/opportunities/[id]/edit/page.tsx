import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteOpportunityButton } from "@/features/opportunities/delete-opportunity-button";
import { OpportunityForm } from "@/features/opportunities/opportunity-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit opportunity" };

export default async function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: opportunity }, { data: companies }, { data: contacts }] = await Promise.all([
    supabase.from("opportunities").select("*").eq("id", id).maybeSingle(),
    supabase.from("companies").select("id, name, organization_type").order("name"),
    supabase.from("contacts").select("id, name, company_id, contact_type").order("name"),
  ]);

  if (!opportunity) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <Link href="/opportunities" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Opportunities</Link>
        <DeleteOpportunityButton opportunityId={opportunity.id} roleTitle={opportunity.role_title} />
      </div>
      <Card className="mt-5">
        <CardHeader><CardTitle>{opportunity.role_title}</CardTitle><CardDescription>Update the stage, fit, and next action.</CardDescription></CardHeader>
        <CardContent><OpportunityForm companies={companies ?? []} contacts={contacts ?? []} opportunity={opportunity} /></CardContent>
      </Card>
    </div>
  );
}
