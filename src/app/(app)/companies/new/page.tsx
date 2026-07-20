import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyForm } from "@/features/companies/company-form";

export const metadata: Metadata = { title: "New company" };

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/companies" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Companies
      </Link>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>New company</CardTitle>
          <CardDescription>Add an organization to your target market.</CardDescription>
        </CardHeader>
        <CardContent><CompanyForm /></CardContent>
      </Card>
    </div>
  );
}
