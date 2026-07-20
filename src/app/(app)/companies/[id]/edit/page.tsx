import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyForm } from "@/features/companies/company-form";
import { DeleteCompanyButton } from "@/features/companies/delete-company-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit company" };

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: company } = await supabase.from("companies").select("*").eq("id", id).maybeSingle();

  if (!company) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <Link href="/companies" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Companies
        </Link>
        <DeleteCompanyButton companyId={company.id} companyName={company.name} />
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>{company.name}</CardTitle>
          <CardDescription>Update company intelligence and priority.</CardDescription>
        </CardHeader>
        <CardContent><CompanyForm company={company} /></CardContent>
      </Card>
    </div>
  );
}
