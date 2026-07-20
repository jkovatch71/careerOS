"use client";

import { Trash2 } from "lucide-react";

import { deleteContact } from "@/app/(app)/contacts/actions";
import { Button } from "@/components/ui/button";

export function DeleteContactButton({ contactId, contactName }: { contactId: string; contactName: string }) {
  return (
    <form action={deleteContact.bind(null, contactId)} onSubmit={(event) => {
      if (!window.confirm(`Delete ${contactName}? This cannot be undone.`)) event.preventDefault();
    }}>
      <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="size-4" /> Delete</Button>
    </form>
  );
}
