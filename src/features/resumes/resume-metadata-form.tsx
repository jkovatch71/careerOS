"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import { updateResume, type ResumeActionState } from "@/app/(app)/resumes/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Resume } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const initialState: ResumeActionState = {};

export function ResumeMetadataForm({ resume }: { resume: Resume }) {
  const [state, formAction, pending] = useActionState(updateResume.bind(null, resume.id), initialState);
  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="name">Resume name</Label><Input id="name" name="name" defaultValue={resume.name} required autoFocus /></div>
        <div className="space-y-2"><Label htmlFor="focus">Focus</Label><Input id="focus" name="focus" defaultValue={resume.focus ?? ""} /></div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="is_master" defaultChecked={resume.is_master ?? false} className="size-4 accent-primary" /> Set as master resume</label>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="notes">Notes</Label><textarea id="notes" name="notes" rows={3} defaultValue={resume.notes ?? ""} className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" /></div>
      </div>
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      <div className="flex justify-end gap-3 border-t pt-5"><Link href="/resumes" className={cn(buttonVariants({ variant: "ghost" }))}>Cancel</Link><Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : null}Save changes</Button></div>
    </form>
  );
}
