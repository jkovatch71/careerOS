"use client";

import { Trash2 } from "lucide-react";
import { deleteResume } from "@/app/(app)/resumes/actions";
import { Button } from "@/components/ui/button";

export function DeleteResumeButton({ resumeId, resumeName }: { resumeId: string; resumeName: string }) {
  return <form action={deleteResume.bind(null, resumeId)} onSubmit={(event) => { if (!window.confirm(`Delete ${resumeName} and its file? This cannot be undone.`)) event.preventDefault(); }}><Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="size-4" /> Delete</Button></form>;
}
