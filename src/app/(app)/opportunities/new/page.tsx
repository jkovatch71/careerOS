import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpportunityForm } from "@/features/opportunities/opportunity-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "New opportunity" };

export default async function NewOpportunityPage() {
  const supabase = await createClient();
  const { data: companies } = await supabase.from("companies").select("id, name").order("name");

  if (!companies?.length) redirect("/companies/new");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/opportunities" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Opportunities</Link>
      <Card className="mt-5">
        <CardHeader><CardTitle>New opportunity</CardTitle><CardDescription>Capture a role and its next decision point.</CardDescription></CardHeader>
        <CardContent><OpportunityForm companies={companies} /></CardContent>
      </Card>
    </div>
  );
}
