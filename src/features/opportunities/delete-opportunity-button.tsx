"use client";

import { Trash2 } from "lucide-react";

import { deleteOpportunity } from "@/app/(app)/opportunities/actions";
import { Button } from "@/components/ui/button";

export function DeleteOpportunityButton({ opportunityId, roleTitle }: { opportunityId: string; roleTitle: string }) {
  return (
    <form
      action={deleteOpportunity.bind(null, opportunityId)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${roleTitle}? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
        <Trash2 className="size-4" /> Delete
      </Button>
    </form>
  );
}
