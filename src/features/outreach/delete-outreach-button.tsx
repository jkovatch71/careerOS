"use client";
import { Trash2 } from "lucide-react";
import { deleteOutreach } from "@/app/(app)/outreach/actions";
import { Button } from "@/components/ui/button";
export function DeleteOutreachButton({ id }: { id: string }) { return <form action={deleteOutreach.bind(null, id)} onSubmit={(event) => { if (!window.confirm("Delete this outreach entry? This cannot be undone.")) event.preventDefault(); }}><Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="size-4" /> Delete</Button></form>; }
