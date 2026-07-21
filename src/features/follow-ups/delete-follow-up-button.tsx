"use client";
import { Trash2 } from "lucide-react";
import { deleteFollowUp } from "@/app/(app)/follow-ups/actions";
import { Button } from "@/components/ui/button";
export function DeleteFollowUpButton({ id }: { id: string }) { return <form action={deleteFollowUp.bind(null, id)} onSubmit={(event) => { if (!window.confirm("Delete this follow-up? This cannot be undone.")) event.preventDefault(); }}><Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="size-4" /> Delete</Button></form>; }
