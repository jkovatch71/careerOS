"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteCompany } from "@/app/(app)/companies/actions";

export function DeleteCompanyButton({ companyId, companyName }: { companyId: string; companyName: string }) {
  const action = deleteCompany.bind(null, companyId);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${companyName}? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
        <Trash2 className="size-4" /> Delete
      </Button>
    </form>
  );
}
